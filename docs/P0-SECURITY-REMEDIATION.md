# Vila Sales — P0 security and integrity remediation

## Status

**Not production-ready.** This branch is a containment pass, not a release approval. The current JSON-file repository adapter fails closed when `NODE_ENV=production`; a managed, shared transactional database and migration are still required. Online collection and customer-facing payment confirmation are intentionally disabled. Do not merge or deploy to handle real orders, invoices, customers, or money until the release gates below pass.

## Changes in this branch

- Added a server-side signed-session gate for API requests and internal pages; invalid/expired sessions are rejected, and unmatched mutations default to ADMIN-only.
- Removed the hard-coded session-signing secret fallback and replaced plaintext password comparison with a salted scrypt-hash verifier. Demo logins have been removed from the login UI and seed-user list.
- Removed the checked-in JSON business database from the branch and added it to `.gitignore`.
- Made the JSON adapter development-only, clone transaction state, and throw on failed persistence rather than reporting success.
- Orders use server catalog rates, validate whole-number positive quantities, reject duplicate lines and over-credit-limit orders, and defer stock mutation until validation passes.
- Invoice generation uses catalog prices and rejects missing/invalid HSN and GST-rate master data; GST calculations reject a missing/invalid seller GSTIN, invalid supplied customer GSTIN, unknown place of supply, unsupported tax rate, and missing/invalid HSN instead of defaulting silently.
- Invoice receipts reject duplicate transaction references, invalid amounts, overpayment, and payment beyond the outstanding invoice balance. The manual accounts endpoint cannot label an entry as a gateway-card payment.
- Automatic gateway verification returns a disabled response until a persisted intent-to-invoice mapping and signed webhook reconciliation exist. The customer payment confirmation flow no longer pretends a simulated OTP/UTR means an order was paid.
- Return approval now refuses fabricated return records, missing SKU/quantity, and repeat restocking. Goods receipts and inventory adjustments require valid quantities and configured stock locations.
- Invoice email delivery requires an authenticated staff role and resolves the invoice from the server database; client-supplied invoice totals are not trusted. Demo notification tokens and offline simulated success are rejected.
- Company legal/banking fields are read from environment configuration rather than committed constants. GSTIN format/checksum validation is available.

## Release blockers that remain

1. **Implement a real database adapter** (managed PostgreSQL recommended) and migrations. All modules must use the same durable database, real transactions, uniqueness constraints, and atomic stock reservation. Configure backup/recovery and test cold starts/multiple instances.
2. **Provision identity correctly.** Generate `SESSION_SECRET`; provision an administrator with `ADMIN_EMAIL` and an `ADMIN_PASSWORD_HASH` created with `node scripts/hash-password.mjs`. Replace this local bootstrap mechanism with a managed user lifecycle (invite/reset/deactivate) before commercial launch. Add login rate limiting and session revocation/rotation.
3. **Populate and verify business master data.** Confirm legal entity name, seller GSTIN/PAN/state/address, product HSN/GST rates, customer GSTIN/state/address, SKU prices, credit limits, warehouses, supplier and bank/UPI details against authoritative records. Current seed catalogues do not contain verified tax metadata, and invalid sample customer GSTINs will now fail validation.
4. **Build actual customer authentication.** The present gate protects checkout/cart/payment routes because there is no secure buyer account and tenant-to-customer mapping. Do not expose internal staff sessions to customers. Implement buyer sessions and customer-scoped order history before reopening the storefront checkout.
5. **Integrate payment collection end-to-end.** Use a vetted QR library/provider, persist payment intents with order/invoice IDs and exact server-derived amounts, verify provider signatures on the server, process signed/idempotent webhooks, and reconcile each payment once. Manual UTR submission must remain pending until Accounts matches bank statements. QR decoding tests alone do not establish that a UPI VPA or bank account is valid.
6. **Complete order-to-cash integration.** Dispatch, challan, returns, invoices, payments, customer balances, dashboards and reports must all read/write the same records. Remove localStorage as an authoritative order store; add transaction-level idempotency and audit trails.
7. **Test before merge.** Add automated API permission, mutation, financial-integrity, GST, stock-ledger, email, mobile and end-to-end tests. Run `npm ci`, `npx tsc --noEmit`, lint, `npm run build`, and staging tests with negative cases, two sessions/devices and concurrent requests.

## Manual retest checklist

- Anonymous requests return 401/403 on every private API; no forged/expired token works.
- Each role can access only the intended routes/actions.
- An order cannot override catalogue price, use quantity <= 0/non-integer, exceed the customer's credit limit, or partially mutate stock if validation fails.
- An invoice cannot be created with arbitrary price, unconfigured HSN/tax rate, invalid seller/customer GSTIN or unknown place of supply.
- Payment amount above balance, duplicate reference, gateway-card on the manual route, or verification without the role is rejected.
- A fake UTR/OTP never changes the invoice to PAID; a verified signed webhook is idempotent before online collection is enabled.
- Return restocking only changes the recorded SKU and quantity once. Goods receipt and stock adjustment use valid product/warehouse combinations.
- Write failure is returned as a failure; data remains consistent across cold starts and concurrent instances.
- Invoice email can only send the stored invoice to the registered customer email.
- Customer storefront checkout cannot use staff identity or see another customer's data.
- Visual, mobile, accessibility, performance and browser end-to-end audits are completed separately; this branch has not been browser-tested.

## Sensitive-data handling

Deleting a file in this branch does **not** remove its contents from earlier Git commits, forks, caches or clones. If any committed account number, IFSC, VPA, contact detail or other data in `data/vilasales-db.json` was real, rotate/change the relevant bank/UPI or credentials, assess access logs and consider a coordinated Git-history rewrite. Never assume deleting the current file alone has remediated prior exposure.
