const express = require("express");
const router = express.Router();
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  createBookingUpdate,
  getBookingDetails,
} = require("../controllers/bookingUpdateController");


router.get("/:type/:bookingId", authenticate, getBookingDetails);

router.post(
  "/:type/:bookingId",
  authenticate,
  upload.single("uploadTicket"),
  createBookingUpdate
);



module.exports = router;  
