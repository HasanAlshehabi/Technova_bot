import {ChatOllama, OllamaEmbeddings} from "@langchain/ollama";

export const chat = new ChatOllama ({
         model: "qwen2.5:3b-instruct",
    });

export const embeddings = new OllamaEmbeddings ({
        model:"nomic-embed-text",
    });