/**
 * Test-build flag. `scripts/build.mjs` rewrites this to false and strips
 * every TEST_HOOK block, so a production bundle has no roll hook even
 * when it is served from localhost.
 */
export const TEST_BUILD = true;
