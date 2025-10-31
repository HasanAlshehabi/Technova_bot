export const ALLOWED_WORDS = [
  "technova","kundtjänst","support","öppettider","dator","telefon","tillbehör",
  "beställ","beställning","order","ordernummer","bekräftelse","avboka","ändra",
  "leverans","leveranstid","frakt","fraktbolag","postnord","dhl","budbee","spårning","spårningsnummer",
  "danmark","finland","norge",
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
  if (/(garanti|tillverkningsfel|vattenskador|vattenskada|fysiska skador|reservdel|laddare|batteri|kabel|novatech|quantumgear)/.test(s)) return "Frågor om produkter";
  if (/(ångerrätt|retur|returblankett|returfrakt|återbetal)/.test(s)) return "Retur- och återbetalningspolicy";
  if (/(leverans|leveranstid|frakt|fraktbolag|postnord|dhl|budbee|spårning|spårningsnummer|danmark|finland|norge|utanför sverige)/.test(s)) return "Frågor om leverans och frakt";
  if (/(beställ|beställning|order|ordernummer|bekräftelse|avboka|ändra)/.test(s)) return "Frågor om beställningar";
  if (/(gdpr|personuppgift|tredje part|anonymiseras|kunddata|integritet)/.test(s)) return "Integritetspolicy";
  if (/(fjärrsupport|produkten.*fungerar|drivrutin|uppdatering)/.test(s)) return "Tekniskt stöd";
  if (/(originaltillbehör|hög värme|litiumbatterier|rumstemperatur)/.test(s)) return "Säkerhetsrekommendationer";
  if (/(hållbarhet|återvinning|emballage|greentech)/.test(s)) return "Miljö och hållbarhet";
  if (/(öppettider|telefon|e-handelsföretag|kundtjänst:)/.test(s)) return "Företagsinformation";
  // fallback: ta första icke-tomma raden och rensa "3. "
  const first = (text || "").split("\n").map(x => x.trim()).find(Boolean) || "";
  return first.replace(/^\d+\.\s*/, "") || "TechNova - FAQ & Policydokument";
}

// konvertera docs till kontextsträng
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