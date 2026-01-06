const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticate } = require("../middleware/authMiddleware"); // adjust path

router.post("/collect", authenticate, paymentController.collectPayment);


router.get("/booking/:type/:id/invoice", authenticate, paymentController.getBookingInvoice);

router.get("/client/:bookingId/:type/invoice", authenticate, paymentController.getClientInvoice);

module.exports = router;
