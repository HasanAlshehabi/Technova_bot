import { readFile } from "fs/promises";
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OllamaEmbeddings } from "@langchain/ollama";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

async function main() {
  const text = await readFile(path.join(__dirname, "technova.txt"), "utf-8");

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 700,
    chunkOverlap: 80,
    separators: ["\n\n", "\n", " ", ""],
  });

  const documents = await splitter.createDocuments([text], [{ source: "technova.txt" }]);

  const client = createClient(SUPABASE_URL, SUPABASE_API_KEY);
  const embedder = new OllamaEmbeddings({ model: "nomic-embed-text" });

  await SupabaseVectorStore.fromDocuments(documents, embedder, {
    client,
    tableName: "documents",
  });

  console.log("Upload complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});