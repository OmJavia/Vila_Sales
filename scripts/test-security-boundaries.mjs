import assert from "node:assert/strict";
import crypto from "node:crypto";
import { spawn } from "node:child_process";

const port = Number(process.env.PORT || 3210);
const baseUrl = `http://127.0.0.1:${port}`;
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error("Test requires SESSION_SECRET to be set to at least 32 characters.");
}

function createTestToken(role, secret) {
  const payload = {
    userId: `test-${role.toLowerCase()}`,
    name: `Test ${role}`,
    email: `test-${role.toLowerCase()}@example.invalid`,
    role,
    expiresAt: Date.now() + 60_000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

const cases = [];
async function check(name, path, expectedStatus, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || "GET",
    redirect: "manual",
    headers: {
      ...(options.token ? { cookie: `vs_session_token=${options.token}`, authorization: `Bearer ${options.token}` } : {}),
      ...(options.body ? { "content-type": "application/json" } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  const detail = response.status === expectedStatus ? "PASS" : "FAIL";
  const responseText = await response.clone().text();
  cases.push({ name, status: response.status, expectedStatus, detail });
  assert.equal(
    response.status,
    expectedStatus,
    name + ": expected HTTP " + expectedStatus + ", got " + response.status + "; response=" + responseText.slice(0, 300)
  );
}

const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-p", String(port)],
  {
    env: { ...process.env, PORT: String(port), SESSION_SECRET: sessionSecret },
    stdio: "ignore",
  }
);

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt++) {
    if (child.exitCode !== null) throw new Error(`Next server exited unexpectedly with code ${child.exitCode}`);
    try {
      const response = await fetch(`${baseUrl}/login`);
      if (response.status >= 200 && response.status < 500) return;
    } catch {
      // Server is still starting; retry briefly.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Next server did not become ready within 20 seconds.");
}

try {
  await waitForServer();

  await check("Anonymous customer-data read is denied", "/api/customers", 401);
  await check("Anonymous order read is denied", "/api/orders", 401);
  await check("Anonymous settings mutation is denied", "/api/settings", 401, {
    method: "POST",
    body: { companyName: "Attacker Change" },
  });
  await check("Anonymous payment intent is denied before payment logic", "/api/payments/create-intent", 401, {
    method: "POST",
    body: { amount: 0.01 },
  });
  await check("Unauthenticated internal page redirects to login", "/dashboard", 307);
  await check("Checkout payment page redirects to login", "/shop/payment", 307);

  const legacySecret = "vila-sales-secure-production-secret-2026-key-99881";
  await check(
    "Token forged with removed hard-coded secret is denied",
    "/api/customers",
    401,
    { token: createTestToken("ADMIN", legacySecret) }
  );

  await check(
    "Warehouse session cannot mutate company settings",
    "/api/settings",
    403,
    { method: "POST", token: createTestToken("WAREHOUSE", sessionSecret), body: { companyName: "Attacker Change" } }
  );

  await check("Public storefront catalogue remains reachable", "/shop", 200);

  process.stdout.write(
    "Security boundary regression checks passed:\n" +
    cases.map((test) => `- ${test.detail}: ${test.name} (HTTP ${test.status})`).join("\n") +
    "\n"
  );
} finally {
  child.kill("SIGTERM");
}
