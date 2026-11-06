// popup.js
(async () => {
  const tabId = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]?.id;
  const statusEl = document.getElementById('status');
  const sleepBtn = document.getElementById('sleepBtn');
  const wakeBtn = document.getElementById('wakeBtn');
  const perSiteInput = document.getElementById('perSiteInput');
  const setDefaultBtn = document.getElementById('setDefaultBtn');
  const siteInfo = document.getElementById('siteInfo');

  if (!tabId) {
    statusEl.textContent = 'No active tab found.';
    sleepBtn.disabled = true;
    wakeBtn.disabled = true;
    return;
  }

  const state = await chrome.runtime.sendMessage({ type: 'getState', tabId });
  const site = state.site || '(unknown)';
  siteInfo.textContent = `Site: ${site}`;

  const effective = effectivePolicy(state.perTabPolicy, state.perSiteDefault);
  const minutes = resolveFromPolicy(effective);
  statusEl.textContent = state.sleeping
    ? `Sleeping · auto-sleep ${minutes > 0 ? minutes + 'm default' : 'off'}`
    : `Awake · idle ${state.idleMinutes ?? 0}m · auto-sleep ${minutes > 0 ? minutes + 'm default' : 'off'}`;

  sleepBtn.onclick = () => chrome.runtime.sendMessage({ type: 'sleep', tabId });
  wakeBtn.onclick = () => chrome.runtime.sendMessage({ type: 'wake', tabId });

  const storedDefault = await chrome.storage.local.get('tabsleep/perSiteDefault');
  perSiteInput.value = storedDefault['tabsleep/perSiteDefault'] ?? 0;

  setDefaultBtn.onclick = async () => {
    const v = Math.max(0, Math.floor(Number(perSiteInput.value) || 0));
    await chrome.runtime.sendMessage({ type: 'setPerSiteDefault', minutes: v });
    statusEl.textContent = `Default set to ${v}m`;
  };
})();
