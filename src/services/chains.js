import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { chat } from "./llm.js";
import { retrieve } from "./retriever.js";
import { supportPrompt } from "./prompts.js";
import {isAllowed,docsToContext,historyToText,stripAnyModelSources,buildSources,} from "./ragUtils.js";

export async function answerQuestion(question, opts = {}) {
  const { history = [] } = opts;

  if (!isAllowed(question)) {
    return {
      answer:
        "Jag kan inte hjälpa till med den frågan. Jag besvarar endast frågor relaterade till TechNova AB:s produkter, leveranser, garantier och policydokument.",
      citations: [],
    };
  }

  const { docs, citations } = await retrieve(question, 3);
  const context = docsToContext(docs);
  const historyText = historyToText(history);

  const chain = RunnableSequence.from([
    new RunnablePassthrough(),
    supportPrompt,
    chat,
    new StringOutputParser(),
  ]);

  let answer = await chain.invoke({ context, question, history: historyText });

  // Gör källor stabilt & alltid närvarande
  answer = stripAnyModelSources(answer).trim();
  if (!/\[#\d+\]/.test(answer) && docs.length) {
    answer = `${answer}`;
  }
  answer += buildSources(answer, docs);

  return { answer, citations };
}