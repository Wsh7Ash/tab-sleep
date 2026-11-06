/**
 * idle.js — pure idle-time bookkeeping.
 * MVP logic lives here so it can be unit-tested without browser APIs.
 */

/**
 * Normalize a policy spec into effective numeric minutes for idle auto-sleep.
 * Policy can be:
 *  - false/null/0 -> no auto-sleep
 *  - number -> minutes of idle before auto-sleep
 *  - { minutes: number } -> same
 */
export function resolveIdleMinutes(policy) {
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

/**
 * Should this tab auto-sleep now?
 * - idleMinutes: minutes the tab has been idle
 * - policy: policy spec resolved by resolveIdleMinutes
 */
export function shouldAutoSleep(idleMinutes, policy) {
  const limit = resolveIdleMinutes(policy);
  if (limit <= 0) return false;
  return idleMinutes >= limit;
}

/**
 * Advance idle clock by dt minutes, but never let a sleeping tab accrue
 * more idle time while asleep (sleep pauses the idle clock in this MVP model).
 */
export function advanceIdle(state, dtMinutes) {
  const next = { ...state };
  if (next.sleeping) {
    return next; // sleeping tabs do not accrue idle time in this MVP
  }
  next.idleMinutes = Math.max(0, (next.idleMinutes || 0) + dtMinutes);
  return next;
}

/**
 * Mark a tab as sleeping. Preserves policy and idle time.
 */
export function sleepTab(state) {
  return { ...state, sleeping: true, lastSleepAt: Date.now() };
}

/**
 * Wake a tab. Resets sleeping flag but preserves policy and prior idle time
 * so a freshly-woken tab can immediately re-evaluate auto-sleep if it was
 * already past its threshold before sleeping.
 */
export function wakeTab(state) {
  return { ...state, sleeping: false, lastSleepAt: null };
}
