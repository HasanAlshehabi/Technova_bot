import "./chatmessage.css";

export default function ChatMessage({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`msg ${isUser ? "right" : "left"}`}>
      <div className="bubble">{content}</div>
    </div>
  );
}
