// TrainingContentBlockFieldEditor.js
//
// A generic, recursive "structured fields" editor for one content block's
// `data` object. Every training content block type (hero, richText,
// timeline, statCallouts, the 40-item adminScript, domainGrid, capsMap...)
// has a different shape, and hand-building a bespoke form per type is a
// later CMS phase (see the "+ Add Content" block palette in the project
// brief). For now, this walks whatever shape a block already has and
// renders a labeled control for every field — strings become text boxes,
// lists become add/remove/reorder rows, nested objects become nested
// groups — so an admin always edits labeled fields, never raw JSON,
// regardless of block type.
//
// "type" is intentionally never shown — it's structural (matches the
// block_type column) and edited nowhere in this UI.

import React from "react";

const inputStyle = {
  width: "100%", padding: "8px 11px", border: "1.5px solid var(--border)", borderRadius: 8,
  fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff",
};
const labelStyle = {
  fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
  color: "var(--ink-mid)", display: "block", marginBottom: 4,
};
const groupStyle = {
  border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", marginBottom: 10, background: "var(--surface, #fafafa)",
};
const smallBtn = {
  background: "none", border: "1.5px solid var(--border)", borderRadius: 7, padding: "4px 10px",
  fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "var(--ink-mid)",
};

function titleCase(key) {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
}

function emptyLike(sample) {
  if (typeof sample === "string") return "";
  if (typeof sample === "number") return 0;
  if (typeof sample === "boolean") return false;
  if (Array.isArray(sample)) return sample.length ? [emptyLike(sample[0])] : [];
  if (sample && typeof sample === "object") {
    const out = {};
    Object.keys(sample).forEach((k) => { out[k] = emptyLike(sample[k]); });
    return out;
  }
  return "";
}

// Renders one value (of any shape) with a setter. `path` is just for React keys.
function ValueEditor({ value, onChange, path }) {
  if (typeof value === "string") {
    const long = value.length > 70 || value.includes("\n");
    return long
      ? <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={value} onChange={(e) => onChange(e.target.value)} />
      : <input style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)} />;
  }
  if (typeof value === "number") {
    return <input type="text" inputMode="decimal" style={inputStyle} value={value} onChange={(e) => {
      const n = e.target.value.trim();
      onChange(n === "" ? "" : (isNaN(Number(n)) ? n : Number(n)));
    }} />;
  }
  if (typeof value === "boolean") {
    return (
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} /> {value ? "Yes" : "No"}
      </label>
    );
  }
  if (Array.isArray(value)) {
    return (
      <div>
        {value.map((item, i) => (
          <div key={`${path}-${i}`} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ flex: 1, ...(typeof item === "object" && item !== null ? groupStyle : {}) }}>
              <ValueEditor
                value={item}
                path={`${path}-${i}`}
                onChange={(v) => {
                  const next = value.slice();
                  next[i] = v;
                  onChange(next);
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button type="button" style={smallBtn} disabled={i === 0} onClick={() => {
                const next = value.slice();
                [next[i - 1], next[i]] = [next[i], next[i - 1]];
                onChange(next);
              }}>↑</button>
              <button type="button" style={smallBtn} disabled={i === value.length - 1} onClick={() => {
                const next = value.slice();
                [next[i + 1], next[i]] = [next[i], next[i + 1]];
                onChange(next);
              }}>↓</button>
              <button type="button" style={{ ...smallBtn, color: "var(--pink, #E8175D)" }} onClick={() => {
                onChange(value.filter((_, idx) => idx !== i));
              }}>Remove</button>
            </div>
          </div>
        ))}
        <button type="button" style={smallBtn} onClick={() => {
          onChange([...value, emptyLike(value[0])]);
        }}>+ Add item</button>
      </div>
    );
  }
  if (value && typeof value === "object") {
    return (
      <div>
        {Object.keys(value).map((k) => (
          <div key={k} style={{ marginBottom: 10 }}>
            <label style={labelStyle}>{titleCase(k)}</label>
            <ValueEditor
              value={value[k]}
              path={`${path}-${k}`}
              onChange={(v) => onChange({ ...value, [k]: v })}
            />
          </div>
        ))}
      </div>
    );
  }
  // null/undefined — show as plain text input so it's still editable
  return <input style={inputStyle} value={value == null ? "" : String(value)} onChange={(e) => onChange(e.target.value)} />;
}

// Top-level: hides the "type" key (structural, not content) and renders
// every other field. `data` / `onChange` are the block's full data object.
export default function TrainingContentBlockFieldEditor({ data, onChange }) {
  const keys = Object.keys(data || {}).filter((k) => k !== "type");
  if (keys.length === 0) {
    return <p style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>This block has no editable fields.</p>;
  }
  return (
    <div>
      {keys.map((k) => (
        <div key={k} style={{ marginBottom: 16 }}>
          <label style={labelStyle}>{titleCase(k)}</label>
          <ValueEditor
            value={data[k]}
            path={k}
            onChange={(v) => onChange({ ...data, [k]: v })}
          />
        </div>
      ))}
    </div>
  );
}