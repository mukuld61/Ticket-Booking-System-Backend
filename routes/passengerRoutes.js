const  exprees = require('express');
const router = exprees.Router();
const {  getPassengerList,updatePassenger,getPassengersByClient} = require('../controllers/passengerController');
const { authenticate } = require('../middleware/authMiddleware');   

// router.post('/add', authenticate, addPassenger);

router.get("/passengers",authenticate , getPassengerList);

router.put("/:passengerId", authenticate, updatePassenger);

router.get(
  "/clients/:clientId",
  authenticate,
  getPassengersByClient
);


module.exports = router;