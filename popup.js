import { REASONS, levelOf } from "./check.js";

const TITLES = {
  danger: "Peligrosa",
  suspicious: "Sospechosa",
  clear: "Sin detecciones",
};

function show({ host = "", title, level = "", reasons = [], note = "" }) {
  document.getElementById("host").textContent = host;
  const heading = document.getElementById("title");
  heading.textContent = title;
  heading.className = level;
  const list = document.getElementById("reasons");
  for (const reason of reasons) {
    const item = document.createElement("li");
    item.textContent = reason;
    list.append(item);
  }
  document.getElementById("note").textContent = note;
}

const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
const key = `tab:${tab?.id}`;
const { [key]: entry } = await chrome.storage.session.get(key);
const host = entry?.origin ? new URL(entry.origin).host : "";

if (!entry) {
  // Tabs that were already open when the extension was installed.
  show({ title: "Esta pestaña no se revisó", note: "Recargá la página para revisarla." });
} else if (entry.state === "skipped") {
  show({ title: "Kaplai no revisa esta página" });
} else if (entry.state === "checking") {
  show({ host, title: "Revisando…" });
  chrome.storage.session.onChanged.addListener((changes) => {
    if (changes[key]) location.reload();
  });
} else if (entry.state === "error") {
  show({ host, title: "No se pudo revisar este sitio", note: "Probá de nuevo en un rato." });
} else {
  const level = levelOf(entry.result);
  show({
    host,
    level,
    title: TITLES[level],
    reasons: entry.result.indicators.map(({ code }) => REASONS[code]).filter(Boolean),
    note:
      level === "clear"
        ? "No encontramos nada, pero eso no garantiza que el sitio sea seguro."
        : "",
  });
}
