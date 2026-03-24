const { exec } = require("child_process");
const { v4: uuidv4 } = require("uuid");
const ScanJob = require("../models/Scanjob");

// Nmap flag presets 
const SCAN_PROFILES = {
  quick:    "-T4 -F --open",                             // top 100 ports, fast
  standard: "-T4 -p 1-1024 --open -sV --version-light", // common ports + svc
  deep:     "-T3 -p- --open -sV -O --osscan-guess",      // all ports + OS detect
};

// Parse raw nmap XML-like / grep-able output
// We use nmap with -oG (grepable) output for reliable parsing
function parseGrepableOutput(raw) {
  const hosts = [];

  const hostBlocks = raw.split("\n").filter((l) => l.startsWith("Host:"));

  for (const line of hostBlocks) {
    // Host: 192.168.1.1 (router.local)   Ports: 22/open/tcp//ssh///, 80/open/tcp//http///
    const ipMatch = line.match(/Host:\s+([\d.]+)\s+\(([^)]*)\)/);
    if (!ipMatch) continue;

    const ip = ipMatch[1];
    const hostname = ipMatch[2] || "";

    const openPorts = [];
    const portsSection = line.match(/Ports:\s+(.+?)(?:\s+Ignored|$)/);
    if (portsSection) {
      const portEntries = portsSection[1].split(",");
      for (const entry of portEntries) {
        const parts = entry.trim().split("/");
        // format: port/state/proto//service//version/
        if (parts.length >= 3 && parts[1] === "open") {
          openPorts.push({
            port: parseInt(parts[0], 10),
            state: parts[1],
            protocol: parts[2],
            service: parts[4] || "unknown",
            version: parts[6] || "",
          });
        }
      }
    }

    // OS hint from comment lines
    let os = "";
    const osMatch = line.match(/OS:\s+([^\\t]+)/);
    if (osMatch) os = osMatch[1].trim();

    hosts.push({ ip, hostname, openPorts, os, status: "up" });
  }

  return hosts;
}

// Build and run the nmap command 
function runNmap(target, scanType) {
  return new Promise((resolve, reject) => {
    const flags = SCAN_PROFILES[scanType] || SCAN_PROFILES.standard;
    // -oG - → grepable output to stdout; no DNS resolve (-n) for speed
    const cmd = `nmap ${flags} -oG - ${target}`;

    exec(cmd, { timeout: 300_000 }, (err, stdout, stderr) => {
      if (err && !stdout) {
        return reject(new Error(stderr || err.message));
      }
      resolve({ stdout, cmd });
    });
  });
}

// POST /api/scans 
exports.startScan = async (req, res) => {
  const { target, scanType = "standard" } = req.body;

  if (!target) {
    return res.status(400).json({ error: "target is required (e.g. 192.168.1.0/24)" });
  }

  // Basic target validation – allow CIDR, single IPs, ranges, hostnames
  const validTarget = /^[\w./:*\-,\s]+$/.test(target.trim());
  if (!validTarget) {
    return res.status(400).json({ error: "Invalid target format" });
  }

  const jobId = uuidv4();
  const job = await ScanJob.create({ jobId, target: target.trim(), scanType });

  // Return immediately – scan runs in background
  res.status(202).json({ jobId, message: "Scan started", status: "running" });

  // ── Background execution ──
  job.status = "running";
  job.startedAt = new Date();
  await job.save();

  try {
    const { stdout, cmd } = await runNmap(target.trim(), scanType);
    const hosts = parseGrepableOutput(stdout);
    const totalOpenPorts = hosts.reduce((s, h) => s + h.openPorts.length, 0);

    job.status = "completed";
    job.completedAt = new Date();
    job.duration = Math.round((job.completedAt - job.startedAt) / 1000);
    job.hosts = hosts;
    job.totalHosts = hosts.length;
    job.totalOpenPorts = totalOpenPorts;
    job.nmapCommand = cmd;
    job.rawOutput = stdout.slice(0, 10_000); // cap stored raw output
  } catch (err) {
    job.status = "failed";
    job.completedAt = new Date();
    job.errorMessage = err.message;
  }

  await job.save();
};

// GET /api/scans 
exports.getAllScans = async (_req, res) => {
  const scans = await ScanJob.find({}, "-rawOutput")
    .sort({ startedAt: -1 })
    .limit(50);
  res.json(scans);
};

// GET /api/scans/:jobId
exports.getScan = async (req, res) => {
  const job = await ScanJob.findOne({ jobId: req.params.jobId }, "-rawOutput");
  if (!job) return res.status(404).json({ error: "Scan not found" });
  res.json(job);
};

// DELETE /api/scans/:jobId 
exports.deleteScan = async (req, res) => {
  const result = await ScanJob.deleteOne({ jobId: req.params.jobId });
  if (result.deletedCount === 0)
    return res.status(404).json({ error: "Scan not found" });
  res.json({ message: "Scan deleted" });
};