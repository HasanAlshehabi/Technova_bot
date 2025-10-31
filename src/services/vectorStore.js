import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { supabase } from "./supabase";
import { embeddings } from "./llm";

export function makeStore() {
  return new SupabaseVectorStore(embeddings, {
    client: supabase,
    tableName: "documents",
    queryName: "match_documents"
  });
}
