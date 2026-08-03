// TodayList.js — a card of colored icon rows, the "what needs a look
// today" pattern instead of a plain data table. Reused across all three
// role homes for whatever their most relevant live feed is (messages,
// follow-ups, pending approvals).
 
import React from "react";
 
export default function TodayList({ title, actionLabel, onAction, items, emptyIcon = "✨", emptyTitle, emptySub, onItemClick }) {
  return (
    <div className="rh-card">
      <div className="rh-card-head">
        <div className="rh-card-title">{title}</div>
        {actionLabel && items?.length > 0 && (
          <button className="rh-card-action" onClick={onAction}>{actionLabel}</button>
        )}
      </div>
      {!items || items.length === 0 ? (
        <div className="rh-empty">
          <div className="rh-empty-icon">{emptyIcon}</div>
          <div className="rh-empty-title">{emptyTitle}</div>
          <div className="rh-empty-sub">{emptySub}</div>
        </div>
      ) : (
        <div className="rh-list">
          {items.map((it, i) => (
            <div className={`rh-list-row ${onItemClick ? "clickable" : ""}`} key={i} onClick={() => onItemClick?.(it)}>
              <div className="rh-list-icon" style={{ background: `${it.color}1f`, color: it.color }}>{it.icon}</div>
              <div className="rh-list-text">
                <div className="rh-list-title">{it.title}</div>
                <div className="rh-list-meta">{it.meta}</div>
              </div>
              {it.badge && (
                <span className="rh-list-badge" style={{ background: `${it.color}1f`, color: it.color }}>{it.badge}</span>
              )}
              {it.action && <button className="rh-list-btn" onClick={(e) => { e.stopPropagation(); it.action.onClick(); }}>{it.action.label}</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 