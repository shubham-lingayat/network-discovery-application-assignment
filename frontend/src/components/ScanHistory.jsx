import React from "react";

function statusIcon(s) {
  if (s === "completed") return "✓";
  if (s === "failed")    return "✗";
  if (s === "running")   return "◌";
  return "·";
}

export default function ScanHistory({ scans, onView, onDelete, activeJobId }) {
  if (!scans.length) {
    return (
      <div className="history-panel">
        <h3 className="history-title">SCAN HISTORY</h3>
        <p className="history-empty">No scans yet</p>
      </div>
    );
  }

  return (
    <div className="history-panel">
      <h3 className="history-title">SCAN HISTORY <span className="count">{scans.length}</span></h3>
      <ul className="history-list">
        {scans.map((s) => (
          <li
            key={s.jobId}
            className={`history-item ${s.jobId === activeJobId ? "active" : ""} ${s.status}`}
            onClick={() => onView(s.jobId)}
          >
            <span className="h-icon">{statusIcon(s.status)}</span>
            <div className="h-body">
              <span className="h-target">{s.target}</span>
              <span className="h-meta">
                {s.scanType} · {s.totalHosts ?? "?"} hosts ·{" "}
                {new Date(s.startedAt).toLocaleTimeString()}
              </span>
            </div>
            <button
              className="h-del"
              onClick={(e) => { e.stopPropagation(); onDelete(s.jobId); }}
              title="Delete"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}