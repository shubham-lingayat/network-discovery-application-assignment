import React, { useState } from "react";

const SERVICE_COLORS = {
  http: "#00d4ff", https: "#00d4ff", ssh: "#ffcc00", ftp: "#ff6b35",
  smtp: "#a78bfa", dns: "#34d399", rdp: "#f87171", mysql: "#fb923c",
  postgresql: "#60a5fa", smb: "#e879f9", telnet: "#f43f5e",
  unknown: "#6b7280",
};

function getServiceColor(service) {
  const s = (service || "").toLowerCase();
  for (const [key, color] of Object.entries(SERVICE_COLORS)) {
    if (s.includes(key)) return color;
  }
  return SERVICE_COLORS.unknown;
}

function PortBadge({ port }) {
  const color = getServiceColor(port.service);
  return (
    <div className="port-badge" style={{ borderColor: color }}>
      <span className="port-num" style={{ color }}>{port.port}</span>
      <span className="port-proto">{port.protocol}</span>
      <span className="port-svc">{port.service}</span>
      {port.version && <span className="port-ver">{port.version}</span>}
    </div>
  );
}

function HostCard({ host }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="host-card">
      <div className="host-header" onClick={() => setExpanded(!expanded)}>
        <div className="host-left">
          <span className="host-status-dot" />
          <div>
            <div className="host-ip">{host.ip}</div>
            {host.hostname && <div className="host-name">{host.hostname}</div>}
            {host.vendor && <div className="host-vendor">{host.vendor}</div>}
          </div>
        </div>
        <div className="host-right">
          <span className="port-count">{host.openPorts.length} open</span>
          <span className="chevron">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      {expanded && (
        <div className="ports-grid">
          {host.openPorts.length === 0 ? (
            <p className="no-ports">No open ports detected</p>
          ) : (
            host.openPorts.map((p, i) => <PortBadge key={i} port={p} />)
          )}
        </div>
      )}
    </div>
  );
}

export default function ScanResults({ scan }) {
  if (!scan) return null;

  const isRunning = scan.status === "running" || scan.status === "pending";
  const isFailed  = scan.status === "failed";

  return (
    <div className="results-panel">
      {/* Header */}
      <div className="results-header">
        <div className="results-meta">
          <h2 className="results-title">
            {isRunning ? "🔍 Scanning…" : isFailed ? "✗ Scan Failed" : "✓ Scan Complete"}
          </h2>
          <div className="results-info">
            <span className="tag">TARGET <b>{scan.target}</b></span>
            <span className="tag">TYPE <b>{scan.scanType}</b></span>
            {scan.duration && <span className="tag">DURATION <b>{scan.duration}s</b></span>}
            {scan.status === "completed" && (
              <>
                <span className="tag hosts">HOSTS <b>{scan.totalHosts}</b></span>
                <span className="tag ports">PORTS <b>{scan.totalOpenPorts}</b></span>
              </>
            )}
          </div>
        </div>
        <div className={`status-pill ${scan.status}`}>{scan.status.toUpperCase()}</div>
      </div>

      {/* Running animation */}
      {isRunning && (
        <div className="running-anim">
          <div className="pulse-rings">
            <div className="ring r1" />
            <div className="ring r2" />
            <div className="ring r3" />
            <div className="ring-center">◎</div>
          </div>
          <p className="running-text">Probing network…</p>
        </div>
      )}

      {/* Error */}
      {isFailed && (
        <div className="error-box">
          <p>⚠ {scan.errorMessage || "Scan failed. Check nmap is installed and target is reachable."}</p>
        </div>
      )}

      {/* Hosts */}
      {scan.hosts && scan.hosts.length > 0 && (
        <div className="hosts-list">
          {scan.hosts.map((h, i) => (
            <HostCard key={i} host={h} />
          ))}
        </div>
      )}

      {scan.status === "completed" && scan.hosts?.length === 0 && (
        <div className="empty-results">
          <p>No hosts with open ports found on <b>{scan.target}</b>.</p>
          <p className="hint">Try a wider target range or a deeper scan profile.</p>
        </div>
      )}
    </div>
  );
}