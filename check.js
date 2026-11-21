// What gets checked, and what the answer means. No Chrome APIs here, so
// `node --test` can run it.

// The same words as the PDF (`INDICATOR_WORDS` in the backend's pdf.py).
// Only the indicators an origin can raise: path and userinfo never leave
// the browser.
export const REASONS = {
  URLHAUS: "Figura en URLhaus, una lista pública de sitios que distribuyen malware.",
  IP_HOST: "Usa una dirección IP en lugar del nombre de un sitio.",
  PUNYCODE: "Su nombre puede imitar a otro sitio con caracteres parecidos.",
  SHORTENER: "Usa un acortador, que oculta el destino real.",
  MANY_SUBDOMAINS: "Tiene muchos subdominios, algo común para imitar sitios conocidos.",
};

function isLocal(host) {
  if (host === "localhost" || host.endsWith(".localhost")) return true;

  if (host.startsWith("[")) {
    const address = host.slice(1, -1);
    if (address === "::1") return true;
    const first = parseInt(address.split(":")[0] || "0", 16);
    // fc00::/7 (unique local) and fe80::/10 (link-local).
    return (first & 0xfe00) === 0xfc00 || (first & 0xffc0) === 0xfe80;
  }

  const octets = host.match(/^(\d+)\.(\d+)\.\d+\.\d+$/);
  if (!octets) return false;
  const [a, b] = [Number(octets[1]), Number(octets[2])];
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

// The origin to ask about, or null when the page is not checked: not a web
// page, or one on this machine or the local network, which is nobody's
// business and which URLhaus cannot know about anyway.
export function originToCheck(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (isLocal(parsed.hostname)) return null;
  return parsed.origin;
}

// Whether a navigation event is about the page the tab is showing. Not
// `frameId === 0`: Chrome also commits pages it prerenders in the background,
// and commits them again, as "active", when they are shown (same for pages
// restored with the back button).
export function isShownPage({ frameType, documentLifecycle }) {
  return frameType === "outermost_frame" && documentLifecycle === "active";
}

// Never "safe": finding nothing proves nothing, same as NO_DETECTION in Kaplai.
export function levelOf(result) {
  if (result.verdict === "MALICIOUS") return "danger";
  if (result.indicators.length) return "suspicious";
  return "clear";
}
