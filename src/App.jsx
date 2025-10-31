import "./App.css";
import { useSupportBot } from "./hooks/useSupportBot";
import MessageList from "./components/messagelist/MessageList";
import InputBar from "./components/inputbar/InputBar";


export default function App() {
  const { messages, ask, loading } = useSupportBot();

  return (
    <main className="app">
      <div className="header">
        <h1>TechNova Support</h1>
      </div>

      <section className="panel">
        <MessageList messages={messages} />
        {loading ? <p style={{ marginTop: 8 }}>Loading…</p> : null}
      </section>

      <section className="panel">
        <InputBar onSend={ask} disabled={loading} />
      </section>
    </main>
  );
}
