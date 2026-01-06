const express = require("express");
const router = express.Router();
const { createLedgerEntry,getAllLedger, getLedgerByClient } = require("../controllers/ledgerController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/create", authenticate, createLedgerEntry);


router.get("/all", authenticate, getAllLedger);


module.exports = router;