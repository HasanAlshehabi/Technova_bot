import { useState } from "react";
import { answerQuestion, parseUsedLabels } from "../services/chains";

function onlyUsedCitations(citations = [], labels = []) {
  if (!labels.length) return citations;
  const map = new Map(citations.map(c => [c.label, c]));
  return labels.map(l => map.get(l)).filter(Boolean);
}

export function useSupportBot() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastCitations, setLastCitations] = useState([]);

  async function ask(question) {
    const q = question.trim();
    if (!q) return;

    setMessages(prev => [...prev, { role: "user", content: q }]);
    setLoading(true);

    try {
      const { answer, citations } = await answerQuestion(q, { history: messages });
      const labels = parseUsedLabels(answer);
      setLastCitations(onlyUsedCitations(citations, labels));
      setMessages(prev => [...prev, { role: "assistant", content: answer }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "assistant", content: "Ett fel uppstod." }]);
    } finally {
      setLoading(false);
    }
  }

  return { messages, ask, loading, lastCitations };
}
