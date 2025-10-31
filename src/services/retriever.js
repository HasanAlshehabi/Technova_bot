import { makeStore } from "./vectorStore.js";
import { pickSectionTitleFromText } from "./ragUtils";

export async function retrieve(question, k = 5) {
  const store = makeStore();
  const filter = { source: "technova.txt" };

  let docs = await store.similaritySearch(question, Math.max(k, 6), filter);
  docs = (docs || []).filter(d => d?.pageContent?.trim().length);

  // säkerställ att varje doc har en titel i metadata
  docs.forEach(d => {
    const meta = d.metadata || {};
    if (!meta.title) meta.title = pickSectionTitleFromText(d.pageContent || "");
    d.metadata = meta;
  });

  // trimma till k stycken
  docs = docs.slice(0, k);

  // bygg citations
  const citations = docs.map((d, i) => ({
    label: `#${i + 1}`,
    snippet: (d.pageContent || "").slice(0, 220),
    meta: d.metadata || {},
  }));

  return { docs, citations };
}