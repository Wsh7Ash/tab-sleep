// background.js — service worker for Tab Sleep
import { effectivePolicy, allowsAutoSleep, resolveFromPolicy } from './lib/policy.js';
import { resolveIdleMinutes, shouldAutoSleep, advanceIdle, sleepTab, wakeTab } from './lib/idle.js';

const PREFIX = 'tabsleep/';

async function loadTabState(tabId) {
  const raw = await chrome.storage.local.get(PREFIX + tabId);
  const saved = raw[PREFIX + tabId];
  if (!saved) {
    return { tabId, site: '(unknown)', perTabPolicy: null, perSiteDefault: 0, idleMinutes: 0, sleeping: false };
  }
  return { tabId, ...saved };
}

async function saveTabState(state) {
  await chrome.storage.local.set({ [PREFIX + state.tabId]: state });
}

async function resolveSiteForTab(tabId) {
  // In a full extension we would use chrome.tabs.get. In MVP we accept a stored site.
  const t = await chrome.storage.local.get(PREFIX + tabId + '/site');
  return t[PREFIX + tabId + '/site'] || '(unknown)';
}

async function updateSiteForTab(tabId, site) {
  await chrome.storage.local.set({ [PREFIX + tabId + '/site']: site });
}

// Called whenever the active tab changes so we can mark the newly active tab
// as not sleeping and reset its idle clock in this MVP model.
async function onActiveTabChanged(activeInfo) {
  const state = await loadTabState(activeInfo.tabId);
  const awake = wakeTab(state);
  await saveTabState(awake);
}

// Periodic tick for idle auto-sleep evaluation.
async function tick() {
  const tabs = await chrome.storage.local.get(null);
  const keys = Object.keys(tabs).filter((k) => k.startsWith(PREFIX) && k.endsWith('/site') === false && k !== PREFIX);
  for (const key of keys) {
    const state = tabs[key];
    if (!state || state.sleeping) continue;
    const effective = effectivePolicy(state.perTabPolicy, state.perSiteDefault);
    const next = advanceIdle(state, 1); // 1-minute tick granularity in MVP
    if (shouldAutoSleep(resolveFromPolicy(effective) && next.idleMinutes, effective)) {
      const asleep = sleepTab(next);
      await saveTabState(asleep);
    } else {
      await saveTabState(next);
    }
  }
}

// Initialize periodic tick every 60 seconds in MVP (simplified).
let tickTimer = null;
async function startTick() {
  if (tickTimer) return;
  tickTimer = setInterval(tick, 60 * 1000);
  await tick();
}

// Listen for messages from popup/content for sleep/wake/site-set.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'sleep') {
    loadTabState(sender.tab.id).then((s) => saveTabState(sleepTab(s))).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'wake') {
    loadTabState(sender.tab.id).then((s) => saveTabState(wakeTab(s))).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'setSite') {
    updateSiteForTab(sender.tab.id, msg.site).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'setPerSiteDefault') {
    chrome.storage.local.set({ [PREFIX + 'perSiteDefault']: msg.minutes }).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'getState') {
    loadTabState(sender.tab.id).then((s) => sendResponse(s));
    return true;
  }
});

// Track active tab changes.
chrome.tabs.onActivated.addListener(onActiveTabChanged);

// Start tick on install/service worker start.
startTick().catch((e) => console.error('tabsleep tick init error', e));
