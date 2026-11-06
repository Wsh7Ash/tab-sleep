// tests/policy_test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { effectivePolicy, allowsAutoSleep, resolveFromPolicy } from '../lib/policy.js';

describe('policy resolution', () => {
  it('perTab overrides perSite when present', () => {
    assert.strictEqual(effectivePolicy(10, 20), 10);
    assert.strictEqual(effectivePolicy(0, 20), 0);
    assert.strictEqual(effectivePolicy(false, 20), false);
  });

  it('falls back to perSite when perTab is null/undefined', () => {
    assert.strictEqual(effectivePolicy(null, 15), 15);
    assert.strictEqual(effectivePolicy(undefined, 15), 15);
  });

  it('resolveFromPolicy normalizes inputs', () => {
    assert.strictEqual(resolveFromPolicy(5.9), 5);
    assert.strictEqual(resolveFromPolicy({ minutes: 7.2 }), 7);
    assert.strictEqual(resolveFromPolicy(false), 0);
    assert.strictEqual(resolveFromPolicy(null), 0);
    assert.strictEqual(resolveFromPolicy(undefined), 0);
  });

  it('allowsAutoSleep is true when resolved minutes >= 1 and false when off', () => {
    assert.ok(allowsAutoSleep(1));
    assert.ok(allowsAutoSleep({ minutes: 1 }));
    assert.ok(allowsAutoSleep(5));
    assert.equal(allowsAutoSleep(0), false);
    assert.equal(allowsAutoSleep(false), false);
    assert.equal(allowsAutoSleep(null), false);
  });
});
