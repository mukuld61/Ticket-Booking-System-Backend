
const express = require("express");
const router = express.Router();
const { createBooking ,getConfirmedBookings,getConfirmedBookingById,updateBooking} = require("../controllers/bookingController");
const { authenticate } = require("../middleware/authMiddleware");


router.post("/booking", authenticate, createBooking);

router.post("/booking/agent/:agentId", authenticate, createBooking);

router.get("/confirmed", authenticate, getConfirmedBookings);

// router.get("/confirmed/:agentId", getConfirmedBookings);

router.get("/confirmed/:type/:bookingId", getConfirmedBookingById); 

router.put("/bookings/:type/:id", updateBooking);

router.put("/bookings/agent/:agentId/:type/:id",authenticate, updateBooking);


module.exports = router; 
