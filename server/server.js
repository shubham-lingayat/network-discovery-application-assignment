require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const scanRoutes = require("./routes/scanRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/nmap_scanner";

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes 
app.use("/api/scans", scanRoutes);

// Health check
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() })
);

// DB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected:", MONGO_URI);
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });