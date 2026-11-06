# Tab Sleep

A small browser extension that lets each tab have its own idle sleep schedule. You can put a noisy tab to bed without changing the OS sleep settings, and choose a per-site default so the sites you check often stay awake while the rest can autosuspend after a few minutes of idleness.

## What it does

- Sleep or wake the current tab from a popup.
- Remember a per-site default idle minute setting; 0 means off.
- Auto-sleep tabs that have been idle longer than the effective threshold for that tab.
- Show whether a tab is sleeping and what its auto-sleep default is.

## Install (MVP)

This is an unpacked extension for Chrome/Chromium with Manifest V3.

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click **Load unpacked** and select the `tab-sleep` folder.

Firefox uses a different manifest format; this MVP targets MV3 Chrome/Chromium first.

## Usage

- Open the extension popup on any page.
- Click **Sleep this tab** or **Wake this tab**.
- Set a per-site default idle time in minutes; 0 disables auto-sleep for that site by default.
- Tabs idle longer than the effective threshold are auto-sleeped by the background service worker on a short periodic tick.

## How the policy works

- Each tab can have its own policy; if it does, that wins.
- Otherwise the per-site default is used.
- A policy of `0`, `false`, or absent disables auto-sleep for that tab.

## Limitations

- This MVP uses a simplified 1-minute tick and stores state per tab id in local extension storage.
- Tab identity in a real browser changes across restarts and navigation; this MVP treats the stored tab id literally and is best used as a demo of the sleep/wake + per-site policy model.
- No remote calls and no host permissions beyond what the popup needs.

## Project structure

- `manifest.json` — MV3 manifest.
- `background.js` — service worker wiring for sleep/wake/site-set and idle tick.
- `popup.html/.css/.js` — popup UI.
- `icon.svg` — extension icon.
- `lib/idle.js`, `lib/policy.js` — pure logic used by both the browser code and the unit tests.
- `tests/` — Node unit tests for the pure logic.
- `LICENSE` — MIT.
