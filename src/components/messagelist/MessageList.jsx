import ChatMessage from "../chatmessages/ChatMessage.jsx";
import "./messagelist.css";

export default function MessageList({ messages }) {
  return (
    <div className="list">
      {messages.map((m, i) => (
        <ChatMessage key={i} role={m.role} content={m.content} />
      ))}
    </div>
  );
}
