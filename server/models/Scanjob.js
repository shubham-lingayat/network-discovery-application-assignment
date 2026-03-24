const mongoose = require("mongoose");

// Port sub-document
const portSchema = new mongoose.Schema(
  {
    port: { type: Number, required: true },
    protocol: { type: String, default: "tcp" },
    state: { type: String, default: "open" },
    service: { type: String, default: "unknown" },
    version: { type: String, default: "" },
  },
  { _id: false }
);

// Host sub-document
const hostSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true },
    hostname: { type: String, default: "" },
    mac: { type: String, default: "" },
    vendor: { type: String, default: "" },
    status: { type: String, default: "up" },
    os: { type: String, default: "" },
    openPorts: [portSchema],
    discoveredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ScanJob document─
const scanJobSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true, unique: true },
    target: { type: String, required: true },        // e.g. "192.168.1.0/24"
    scanType: {
      type: String,
      enum: ["quick", "standard", "deep"],
      default: "standard",
    },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed"],
      default: "pending",
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    duration: { type: Number },                      // seconds
    hosts: [hostSchema],
    totalHosts: { type: Number, default: 0 },
    totalOpenPorts: { type: Number, default: 0 },
    errorMessage: { type: String, default: "" },
    nmapCommand: { type: String, default: "" },      // exact command run
    rawOutput: { type: String, default: "" },
  },
  { timestamps: true }
);

// index for quick lookup by jobId and status
scanJobSchema.index({ jobId: 1 });
scanJobSchema.index({ status: 1 });
scanJobSchema.index({ startedAt: -1 });

module.exports = mongoose.model("ScanJob", scanJobSchema);