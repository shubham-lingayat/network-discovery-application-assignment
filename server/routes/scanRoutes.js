const express = require("express");
const router = express.Router();
const {
  startScan,
  getAllScans,
  getScan,
  deleteScan,
} = require("../controllers/scanController");

router.post("/", startScan);
router.get("/", getAllScans);
router.get("/:jobId", getScan);
router.delete("/:jobId", deleteScan);

module.exports = router;