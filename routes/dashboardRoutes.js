const express = require("express");
const router = express.Router();
const { getBookingStats,getAllBookings ,getAgentBookings,getDashboardStats,getAgentDashboard} = require("../controllers/dashboardController");
const { authenticate,authorizeRoles } = require("../middleware/authMiddleware");

router.get("/dashboard-stats", authenticate, getBookingStats);

router.get("/all-bookings", authenticate, authorizeRoles("admin"), getAllBookings);

router.get("/agent-bookings/:agentId", authenticate, getAgentBookings);

router.get("/stats", authenticate, getDashboardStats);

router.get("/agentStats/:agentId", authenticate, getAgentDashboard);

module.exports = router;
