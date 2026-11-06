/**
 * policy.js — pure per-tab / per-site policy resolution.
 */

/**
 * Effective policy for a tab:
 *  perTab policy wins over perSite default when present.
 *  perTab can be:
 *   - null/undefined -> fall back to perSite
 *   - boolean false -> explicitly no auto-sleep
 *   - number/object -> minutes as in resolveIdleMinutes
 */
export function effectivePolicy(perTab, perSite) {
  if (perTab !== null && perTab !== undefined) {
    return perTab;
  }
  return perSite;
}

/**
 * Does the effective policy allow auto-sleep at all?
 */
export function allowsAutoSleep(effectivePolicy) {
  return resolveFromPolicy(effectivePolicy) > 0;
}

/**
 * Convert an effective policy spec to raw minutes (re-exported from idle).
 */
export function resolveFromPolicy(policy) {
  // Inline minimal version to keep policy module self-contained in MVP;
  // real extension would import from idle.js.
  if (policy === false || policy === null || policy === undefined) {
    return 0;
  }
  if (typeof policy === 'number') {
    return Math.max(0, Math.floor(policy));
  }
  if (policy && typeof policy === 'object' && typeof policy.minutes === 'number') {
    return Math.max(0, Math.floor(policy.minutes));
  }
  return 0;
}
