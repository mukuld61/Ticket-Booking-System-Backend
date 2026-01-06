// utils/billNoGenerator.js
const Invoice = require("../models/invoicesModel");

async function generateBillNo() {
  // Get the last inserted billNo
  const lastInvoice = await Invoice.findOne({
    order: [["id", "DESC"]], // fetch the latest invoice
    attributes: ["billNo"],
  });

  let newBillNo = 1; // default start if no invoice exists
  if (lastInvoice && lastInvoice.billNo) {
    newBillNo = parseInt(lastInvoice.billNo) + 1;
  }

  return newBillNo.toString(); // return as string
}

module.exports = generateBillNo;
