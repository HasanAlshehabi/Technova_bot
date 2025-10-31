import "./inputbar.css";

export default function InputBar({ onSend, disabled }) {
  function handleSubmit(e) {
    e.preventDefault();
    const v = e.target.elements.msg.value.trim();
    if (!v) return;
    onSend(v);
    e.target.reset();
  }
  return (
    <form className="inputbar" onSubmit={handleSubmit}>
      <input name="msg" placeholder="Skriv din fråga…" disabled={disabled} />
      <button type="submit" disabled={disabled}>Skicka</button>
    </form>
  );
}