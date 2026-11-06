// tests/idle_test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveIdleMinutes,
  shouldAutoSleep,
  advanceIdle,
  sleepTab,
  wakeTab,
} from '../lib/idle.js';

describe('idle bookkeeping', () => {
  it('resolveIdleMinutes normalizes policy', () => {
    assert.strictEqual(resolveIdleMinutes(10), 10);
    assert.strictEqual(resolveIdleMinutes({ minutes: 10.9 }), 10);
    assert.strictEqual(resolveIdleMinutes(0), 0);
    assert.strictEqual(resolveIdleMinutes(false), 0);
    assert.strictEqual(resolveIdleMinutes(null), 0);
  });

  it('shouldAutoSleep falls back to no sleep when policy is off', () => {
    assert.equal(shouldAutoSleep(99, false), false);
    assert.equal(shouldAutoSleep(99, 0), false);
    assert.equal(shouldAutoSleep(99, null), false);
  });

  it('shouldAutoSleep triggers at or past threshold', () => {
    assert.equal(shouldAutoSleep(5, 5), true);
    assert.equal(shouldAutoSleep(10, 5), true);
    assert.equal(shouldAutoSleep(4, 5), false);
  });

  it('advanceIdle grows idle time for awake tabs', () => {
    const s = advanceIdle({ idleMinutes: 2, sleeping: false }, 3);
    assert.strictEqual(s.idleMinutes, 5);
    assert.equal(s.sleeping, false);
  });

  it('advanceIdle does not accrue idle time for sleeping tabs', () => {
    const s = advanceIdle({ idleMinutes: 5, sleeping: true }, 10);
    assert.strictEqual(s.idleMinutes, 5);
    assert.equal(s.sleeping, true);
  });

  it('sleepTab preserves policy and idle time', () => {
    const before = { tabId: 1, perTabPolicy: 5, idleMinutes: 7, sleeping: false };
    const after = sleepTab(before);
    assert.equal(after.sleeping, true);
    assert.strictEqual(after.idleMinutes, 7);
    assert.deepStrictEqual(after.perTabPolicy, 5);
  });

  it('wakeTab clears sleeping flag but preserves prior idle time', () => {
    const before = sleepTab({ idleMinutes: 9, sleeping: false });
    const after = wakeTab(before);
    assert.equal(after.sleeping, false);
    assert.strictEqual(after.idleMinutes, 9);
  });
});
