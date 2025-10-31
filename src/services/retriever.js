import { makeStore } from "./vectorStore.js";
import { pickSectionTitleFromText } from "./ragUtils";

// Hämta relevanta dokument och källor från vektordatabasen
export async function retrieve(question, k = 3) {
  const store = makeStore();
  const filter = { source: "technova.txt" };

  let docs = await store.similaritySearch(question, k, filter);
  docs = (docs || []).filter(d => d?.pageContent?.trim());

  docs.forEach(d => {
    const meta = d.metadata || {};
    if (!meta.title) meta.title = pickSectionTitleFromText(d.pageContent || "");
    d.metadata = meta;
  });

  // Bygg källor
  const citations = docs.map((d, i) => ({
    label: `#${i + 1}`,
    snippet: (d.pageContent || "").slice(0, 220),
    meta: d.metadata || {},
  }));

  return { docs, citations };
}