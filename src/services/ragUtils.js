export const ALLOWED_WORDS = [
  "technova","kundtjänst","support","öppettider","dator","telefon","tillbehör",
  "beställ","beställning","order","ordernummer","bekräftelse","avboka","ändra",
  "leverans","leveranstid","frakt","fraktbolag","postnord","dhl","budbee","spårning","spårningsnummer",
  "danmark","finland","norge","sverige","utanför sverige",
  "garanti","fabriksgaranti","tillverkningsfel","vattenskador","vattenskada","fysiska skador",
  "reklamation","fraktsedel","fjärrsupport","reservdel","laddare","batteri","kabel","novatech","quantumgear",
  "retur","ångerrätt","återbetal","returfrakt","returblankett",
  "gdpr","integritet","personuppgift","tredje part","anonymiseras","kunddata",
  "miljö","hållbarhet","återvinning","emballage","greentech"
];

export function isInDomain(text = "") {
  const s = text.toLowerCase();
  return ALLOWED_WORDS.some(w => s.includes(w));
}


export function pickSectionTitleFromText(text = "") {
  const s = text.toLowerCase();
  if (/(garanti|tillverkningsfel|vattenskador|vattenskada|fysiska skador|reservdel|laddare|batteri|kabel|novatech|quantumgear)/.test(s)) 
    return "Frågor om produkter";

  if (/(ångerrätt|retur|returblankett|returfrakt|återbetal)/.test(s)) 
    return "Retur- och återbetalningspolicy";

  if (/(leverans|leveranstid|frakt|fraktbolag|postnord|dhl|budbee|spårning|spårningsnummer|danmark|finland|norge|utanför sverige)/.test(s)) 
    return "Frågor om leverans och frakt";

  if (/(beställ|beställning|order|ordernummer|bekräftelse|avboka|ändra)/.test(s)) 
    return "Frågor om beställningar";

  if (/(gdpr|personuppgift|tredje part|anonymiseras|kunddata|integritet)/.test(s)) 
    return "Integritetspolicy";

  if (/(fjärrsupport|produkten.*fungerar|drivrutin|uppdatering)/.test(s)) 
    return "Tekniskt stöd";

  if (/(originaltillbehör|hög värme|litiumbatterier|rumstemperatur)/.test(s)) 
    return "Säkerhetsrekommendationer";

  if (/(hållbarhet|återvinning|emballage|greentech)/.test(s)) 
    return "Miljö och hållbarhet";

  if (/(öppettider|telefon|e-handelsföretag|kundtjänst:)/.test(s)) 
    return "Företagsinformation";
  
  const first = (text || "").split("\n").map(x => x.trim()).find(Boolean) || "";
  return first.replace(/^\d+\.\s*/, "") || "TechNova - FAQ & Policydokument";
}

export function docsToContext(docs) {
  return docs.map((d, i) => {
    const n = i + 1;
    const title = d?.metadata?.title || pickSectionTitleFromText(d?.pageContent || "");
    return `#${n} [${title}]\n${d.pageContent}`;
  }).join("\n\n");
}

export function historyToText (messages = [], maxTurns = 6) {
  const trimmed = messages.filter(m => m.role === "user" || m.role === "assistant").slice(-maxTurns * 2);
  if (!trimmed.length) return "(ingen historik)";
  return trimmed.map(m => `${m.role === "user" ? "KUND" : "AGENT"}: ${m.content}`).join("\n");
}

export function parseUsedLabels(answer = "") {
  const matches = [...answer.matchAll(/\[#\d+(?:\s*,\s*#\d+)*\]/g)];
  const labels = new Set();
  for (const m of matches) (m[0].match(/#\d+/g) || []).forEach(t => labels.add(t));
  return Array.from(labels).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
}

export function stripAnyModelSources(answer = "") {
  return answer.replace(/\n\s*Källor[\s\S]*$/i, "").trim();
}

export function buildSources(answer = "", docs = []) {
  let labels = parseUsedLabels(answer);
  if (!labels.length && docs.length) labels = ["#1"]; // fallback om modellen glömde citera
  const titles = docs.map(d => d?.metadata?.title || pickSectionTitleFromText(d?.pageContent || ""));
  const pretty = labels.map(lbl => {
    const idx = Math.max(0, parseInt(lbl.slice(1), 10) - 1);
    const title = titles[idx] || "TechNova - FAQ & Policydokument";
    return `${lbl}: ${title}`;
  });
  return pretty.length ? `\n\nKällor\n${pretty.join(", ")}` : "";
}