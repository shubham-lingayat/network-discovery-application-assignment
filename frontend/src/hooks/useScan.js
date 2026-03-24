import { useState, useEffect, useCallback, useRef } from "react";
import { startScan as apiStart, getScan, getAllScans, deleteScan as apiDelete } from "../utils/api";

export function useScan() {
  const [scans, setScans] = useState([]);
  const [activeScan, setActiveScan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pollRef = useRef(null);

  // Load scan history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await getAllScans();
      setScans(data);
    } catch {
      // silently fail on history load
    }
  };

  // Poll a running scan every 3 seconds
  const pollScan = useCallback((jobId) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await getScan(jobId);
        setActiveScan(data);
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(pollRef.current);
          setLoading(false);
          fetchHistory();
        }
      } catch {
        clearInterval(pollRef.current);
        setLoading(false);
      }
    }, 3000);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => clearInterval(pollRef.current), []);

  const runScan = async (target, scanType) => {
    setError("");
    setLoading(true);
    setActiveScan(null);
    try {
      const { data } = await apiStart(target, scanType);
      // Create a placeholder so UI shows "running" immediately
      setActiveScan({ jobId: data.jobId, status: "running", target, scanType, hosts: [] });
      pollScan(data.jobId);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to start scan");
      setLoading(false);
    }
  };

  const deleteScan = async (jobId) => {
    try {
      await apiDelete(jobId);
      setScans((prev) => prev.filter((s) => s.jobId !== jobId));
      if (activeScan?.jobId === jobId) setActiveScan(null);
    } catch {
      // ignore
    }
  };

  const viewScan = async (jobId) => {
    try {
      const { data } = await getScan(jobId);
      setActiveScan(data);
    } catch {
      setError("Could not load scan details");
    }
  };

  return { scans, activeScan, loading, error, runScan, deleteScan, viewScan };
}