// sourcelist.jsx
import "./sourcelist.css";
import { useState } from "react";

function extractTitle(text) {
  const line = (text || "")
    .split("\n")
    .map((s) => s.trim())
    .find((s) => s.length > 0) || "";
  return line.length > 90 ? line.slice(0, 90) + "…" : line;
}

export default function SourceList({ citations, max = 4 }) {
  if (!citations || citations.length === 0) return null;

  // Visa bara top-N för renare layout
  const items = citations.slice(0, max);

  return (
    <div className="sources">
      <div className="sources__header">
        <h3>Källor</h3>
        {citations.length > max && (
          <span className="sources__more">
            Visar {max} av {citations.length}
          </span>
        )}
      </div>

      <ul className="sources__list">
        {items.map((c, i) => (
          <SourceItem key={i} label={c.label} snippet={c.snippet} meta={c.meta} />
        ))}
      </ul>
    </div>
  );
}

function SourceItem({ label, snippet, meta }) {
  const [expanded, setExpanded] = useState(false);

  const titleFromMeta = meta?.title && String(meta.title).trim();
  const title = titleFromMeta || extractTitle(snippet);
  const file = meta?.source || "Okänd källa";
  const short =
    snippet && snippet.length > 220 ? snippet.slice(0, 220) + "…" : snippet;

  const section = meta?.section ? ` · avsnitt: ${meta.section}` : "";
  const page = meta?.page ? ` · s. ${meta.page}` : "";
  const href = meta?.url;

  return (
    <li className="sources__item">
      <div className="sources__badge">{label}</div>
      <div className="sources__body">
        <div className="sources__title">
          {href ? (
            <a href={href} target="_blank" rel="noreferrer">
              {title}
            </a>
          ) : (
            title
          )}
        </div>

        <div className="sources__meta">
          {file}
          {section}
          {page}
        </div>

        <div className="sources__snippet">{expanded ? snippet : short}</div>

        {snippet && snippet.length > 220 && (
          <button
            type="button"
            className="sources__toggle"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Visa mindre" : "Visa mer"}
          >
            {expanded ? "Visa mindre" : "Visa mer"}
          </button>
        )}
      </div>
    </li>
  );
}
