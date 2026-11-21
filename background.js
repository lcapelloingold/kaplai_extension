import { levelOf, originToCheck } from "./check.js";

// Production. Against a local backend: "http://localhost:8000/api/analysis/url-check/".
const API_URL = "https://d19ms4qdhptkqy.cloudfront.net/api/analysis/url-check/";
const CACHE_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 5000;

const BADGES = {
  danger: { text: "!", color: "#d93025" },
  suspicious: { text: "?", color: "#f29900" },
};

// The origin each tab is on now. An answer for a site the tab has already
// left must not paint the site it is on.
const latest = new Map();

function remember(tabId, entry) {
  return chrome.storage.session.set({ [`tab:${tabId}`]: entry });
}

async function cached(origin) {
  const key = `origin:${origin}`;
  const { [key]: hit } = await chrome.storage.session.get(key);
  return hit && Date.now() - hit.at < CACHE_MS ? hit.result : null;
}

async function ask(origin) {
  // The origin goes in the body: in the query string it would end up in the
  // server's access logs.
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: origin }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  await chrome.storage.session.set({ [`origin:${origin}`]: { at: Date.now(), result } });
  return result;
}

// Runs next to the page load, never in front of it: nothing here can block
// or slow down the navigation.
async function check(tabId, url) {
  // Tab-specific badges only reset when the tab closes, so clear the last site's.
  await chrome.action.setBadgeText({ tabId, text: "" });
  const origin = originToCheck(url);
  latest.set(tabId, origin);
  if (!origin) return remember(tabId, { state: "skipped" });

  await remember(tabId, { state: "checking", origin });
  let entry;
  try {
    entry = { state: "done", origin, result: (await cached(origin)) ?? (await ask(origin)) };
  } catch {
    // A failure is never shown as "nothing found".
    entry = { state: "error", origin };
  }
  if (latest.get(tabId) !== origin) return;

  await remember(tabId, entry);
  const badge = entry.state === "done" && BADGES[levelOf(entry.result)];
  if (badge) {
    await chrome.action.setBadgeBackgroundColor({ tabId, color: badge.color });
    await chrome.action.setBadgeText({ tabId, text: badge.text });
  }
}

chrome.webNavigation.onCommitted.addListener(({ tabId, frameId, url }) => {
  if (frameId === 0) check(tabId, url);
});

// A prerendered page that gets shown swaps the tab instead of committing.
chrome.webNavigation.onTabReplaced.addListener(async ({ tabId }) => {
  const frame = await chrome.webNavigation.getFrame({ tabId, frameId: 0 });
  if (frame) check(tabId, frame.url);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  latest.delete(tabId);
  chrome.storage.session.remove(`tab:${tabId}`);
});
