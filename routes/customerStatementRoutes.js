
const express = require("express");
const router = express.Router();

const { getCustomerStatement } = require("../controllers/customerStatementController");

router.get("/:clientId", getCustomerStatement);

module.exports = router;
