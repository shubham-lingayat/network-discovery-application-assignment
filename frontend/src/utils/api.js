import axios from "axios";

const API = axios.create({ baseURL: "/api" });

export const startScan = (target, scanType) =>
  API.post("/scans", { target, scanType });

export const getAllScans = () => API.get("/scans");

export const getScan = (jobId) => API.get(`/scans/${jobId}`);

export const deleteScan = (jobId) => API.delete(`/scans/${jobId}`);