import assert from "node:assert/strict";
import test from "node:test";

import { REASONS, isShownPage, levelOf, originToCheck } from "./check.js";

test("only the origin is sent", () => {
  assert.equal(originToCheck("https://sitio.com/buscar?q=secreto#x"), "https://sitio.com");
});

test("the port is kept", () => {
  assert.equal(originToCheck("http://sitio.com:8080/x"), "http://sitio.com:8080");
});

test("non-web pages are not checked", () => {
  for (const url of [
    "chrome://newtab/",
    "file:///C:/x.html",
    "about:blank",
    "chrome-extension://abc/popup.html",
  ]) {
    assert.equal(originToCheck(url), null, url);
  }
});

test("local and private hosts are not sent", () => {
  for (const url of [
    "http://localhost:3000/",
    "http://app.localhost/",
    "http://127.0.0.1:8000/",
    "http://0.0.0.0:8000/",
    "http://10.0.0.1/",
    "http://192.168.0.1/",
    "http://172.16.0.1/",
    "http://172.31.255.1/",
    "http://169.254.1.1/",
    "http://[::1]/",
    "http://[fd00::1]/",
    "http://[fe80::1]/",
  ]) {
    assert.equal(originToCheck(url), null, url);
  }
});

test("a public address next to a private range is checked", () => {
  assert.equal(originToCheck("http://172.32.0.1/"), "http://172.32.0.1");
});

test("the page shown in the tab is checked", () => {
  assert.equal(isShownPage({ frameType: "outermost_frame", documentLifecycle: "active" }), true);
});

test("a page prerendered in the background is not checked until it is shown", () => {
  assert.equal(isShownPage({ frameType: "outermost_frame", documentLifecycle: "prerender" }), false);
});

test("a frame inside the page is not checked", () => {
  assert.equal(isShownPage({ frameType: "sub_frame", documentLifecycle: "active" }), false);
});

test("a listed site is dangerous", () => {
  assert.equal(levelOf({ verdict: "MALICIOUS", indicators: [{ code: "URLHAUS" }] }), "danger");
});

test("indicators alone are suspicious", () => {
  assert.equal(levelOf({ verdict: "NO_DETECTION", indicators: [{ code: "IP_HOST" }] }), "suspicious");
});

test("nothing found is clear, never safe", () => {
  assert.equal(levelOf({ verdict: "NO_DETECTION", indicators: [] }), "clear");
});

test("there is a reason text for every indicator the origin can raise", () => {
  for (const code of ["IP_HOST", "PUNYCODE", "SHORTENER", "MANY_SUBDOMAINS", "URLHAUS"]) {
    assert.ok(REASONS[code], code);
  }
});
