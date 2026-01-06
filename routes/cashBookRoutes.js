const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const { getCashBook ,addManualCredit,addDebitEntry,getDebitEntries }= require("../controllers/cashBookController");

router.post("/credit",authenticate, addManualCredit);


router.post("/debit",authenticate, addDebitEntry);

router.get("/cashbook", authenticate, getCashBook);

router.get("/debit-entries", authenticate, getDebitEntries);

module.exports = router;
