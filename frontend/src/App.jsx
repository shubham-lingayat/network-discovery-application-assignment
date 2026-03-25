import React from "react";
import ScanForm from "./components/ScanForm";
import ScanResults from "./components/ScanResults";
import ScanHistory from "./components/ScanHistory";
import { useScan } from "./hooks/useScan";
import "./App.css";

export default function App() {
  const { scans, activeScan, loading, error, runScan, deleteScan, viewScan } = useScan();

  return (
    <div className="app">
      {/* ── Left sidebar ── */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">◎</span>
          <div>
            <div className="brand-name">NETSCOPE</div>
            <div className="brand-sub">Network Discovery</div>
          </div>
        </div>

        <ScanHistory
          scans={scans}
          onView={viewScan}
          onDelete={deleteScan}
          activeJobId={activeScan?.jobId}
        />

        <div className="sidebar-footer">
          <div className="tech-badge">MERN Stack</div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="main">
        <header className="page-header">
          <h1 className="page-title">Network Discovery Scanner</h1>
          <p className="page-sub">Identify hosts and open ports on your local network using Nmap</p>
        </header>

        <ScanForm onScan={runScan} loading={loading} />

        {error && (
          <div className="error-banner">
            <span>⚠</span> {error}
          </div>
        )}

        <ScanResults scan={activeScan} />

        {!activeScan && !loading && (
          <div className="idle-state">
            <div className="idle-rings">
              <div className="i-r r1" /><div className="i-r r2" /><div className="i-r r3" />
              <span className="i-center">◎</span>
            </div>
            <p>Enter a target and launch a scan to discover devices on your network</p>
          </div>
        )}
      </main>
    </div>
  );
}