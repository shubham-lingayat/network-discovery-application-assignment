import React, { useState } from "react";

const SCAN_TYPES = [
  { value: "quick",    label: "Quick",    desc: "Top 100 ports · ~10s" },
  { value: "standard", label: "Standard", desc: "Ports 1-1024 · ~30s" },
  { value: "deep",     label: "Deep",     desc: "All 65535 ports · ~5min" },
];

export default function ScanForm({ onScan, loading }) {
  const [target, setTarget] = useState("192.168.1.0/24");
  const [scanType, setScanType] = useState("standard");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!target.trim()) return;
    onScan(target.trim(), scanType);
  };

  return (
    <form className="scan-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="field">
          <label className="label">TARGET</label>
          <input
            className="input"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="192.168.1.0/24  or  10.0.0.1-50"
            disabled={loading}
            spellCheck={false}
          />
        </div>

        <div className="field">
          <label className="label">SCAN PROFILE</label>
          <div className="scan-type-group">
            {SCAN_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`type-btn ${scanType === t.value ? "active" : ""}`}
                onClick={() => setScanType(t.value)}
                disabled={loading}
              >
                <span className="type-label">{t.label}</span>
                <span className="type-desc">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button className="launch-btn" type="submit" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner" />
            SCANNING…
          </>
        ) : (
          <>
            <span className="radar-icon">◎</span>
            LAUNCH SCAN
          </>
        )}
      </button>
    </form>
  );
}