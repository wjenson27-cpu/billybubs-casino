/**
 * Store purchase adapter for Table Craps Premium.
 * The button never writes the entitlement itself. Only a verified
 * transaction from this adapter sets `bb-table-entitlement`.
 * scripts/build.mjs strips the TEST_HOOK block, so a production
 * bundle cannot grant Premium.
 */
import { TEST_BUILD } from "./build-flags.mjs";

const KEY = "bb-table-entitlement";

export async function purchasePremium() {
  /*TEST_HOOK_START*/
  if (TEST_BUILD) {
    // TEST-ONLY STUB. Not a StoreKit or Play Billing purchase.
    // Stripped from production builds. Do not treat this as a receipt.
    localStorage.setItem(KEY, "1");
    return { ok: true, entitlement: "1", testStub: true };
  }
  /*TEST_HOOK_END*/
  return { ok: false, error: "Purchases are not available in this build." };
}

export async function restorePremium() {
  if (localStorage.getItem(KEY) === "1") return { ok: true, entitlement: "1" };
  return { ok: false, error: "No purchases to restore." };
}
