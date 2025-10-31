import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { chat } from "./llm.js";
import { retrieve } from "./retriever.js";
import { supportPrompt } from "./prompts.js";
import { historyToText, docsToContext } from "../services/ragUtils.js";

const ALLOWED_WORDS = [
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

function isAllowed(text = "") {
  const s = text.toLowerCase();
  return ALLOWED_WORDS.some(w => s.includes(w));
}

// hämta titel för ett doc
function getDocTitle(doc) {
  const meta = doc?.metadata || {};
  if (meta.title) return String(meta.title);
  if (meta.section) return String(meta.section);
  const first = (doc?.pageContent || "").split("\n").map(s => s.trim()).find(Boolean) || "";
  return first.replace(/^\d+\.\s*/, "") || "TechNova - FAQ & Policydokument";
}

// plocka etiketter som [#1,#3] ur svaret
export function parseUsedLabels(text = "") {
  const matches = [...text.matchAll(/\[#\d+(?:\s*,\s*#\d+)*\]/g)];
  const labels = new Set();
  for (const m of matches) (m[0].match(/#\d+/g) || []).forEach(t => labels.add(t));
  return Array.from(labels).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
}

// ta bort källsektion från modellens svar
function stripModelSources(answer = "") {
  return answer.replace(/\n\s*Källor[\s\S]*$/i, "").trim();
}

// bygg en källsektion baserat på använda etiketter och doc-titlar
function buildSources(answer = "", docs = []) {
  let labels = parseUsedLabels(answer);
  if (!labels.length && docs.length) labels = ["#1"]; // tvinga minst en källa

  const titles = docs.map(getDocTitle);
  const pretty = labels.map(lbl => {
    const idx = Math.max(0, parseInt(lbl.slice(1), 10) - 1);
    const title = titles[idx] || "TechNova - FAQ & Policydokument";
    return `${lbl}: ${title}`;
  });

  return pretty.length ? `\n\nKällor\n${pretty.join(", ")}` : "";
}

export async function answerQuestion(question, opts = {}) {
  const { history = [] } = opts;

  // svar bara på frågor inom technova
  if (!isAllowed(question)) {
    return {
      answer:
        "Jag kan inte hjälpa till med den frågan. Jag besvarar endast frågor relaterade till TechNova AB:s produkter, leveranser, garantier och policydokument.",
      citations: [],
    };
  }


  const { docs, citations } = await retrieve(question, 5);

  const context = docsToContext(docs);
  const historyText = historyToText(history);

  
  const chain = RunnableSequence.from([
    new RunnablePassthrough(),
    supportPrompt,
    chat,
    new StringOutputParser(),
  ]);

  let answer = await chain.invoke({ context, question, history: historyText });


  answer = stripModelSources(answer);
  if (!/\[#\d+\]/.test(answer) && docs.length) {

    answer = `${answer} [#1]`;
  }
  answer = answer + buildSources(answer, docs);

  return { answer, citations };
}