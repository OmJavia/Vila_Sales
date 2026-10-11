#!/usr/bin/env node
import { randomBytes, scryptSync } from "node:crypto";

async function main() {
  if (process.stdin.isTTY) {
    process.stderr.write("For safety, pipe the password from a hidden prompt into this script; do not pass it as a command-line argument.\n");
    process.exitCode = 2;
    return;
  }

  let password = "";
  for await (const chunk of process.stdin) password += chunk.toString("utf8");
  password = password.replace(/[\r\n]+$/, "");

  if (password.length < 14 || password.length > 1024) {
    process.stderr.write("Use an administrator password between 14 and 1024 characters. No hash was produced.\n");
    process.exitCode = 2;
    return;
  }

  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64).toString("hex");
  process.stdout.write(`scrypt$${salt.toString("hex")}$${hash}\n`);
}

main().catch(() => {
  process.stderr.write("Could not create password hash. No hash was produced.\n");
  process.exitCode = 1;
});
