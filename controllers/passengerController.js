const Passenger = require("../models/passengerModel");
const sequelize = require("../config/db");
const BookingFlight = require("../models/bookingFlightModel");
const BookingBus = require("../models/bookingBusModel");
const BookingRail = require("../models/bookingRailModel");

exports.getPassengerList = async (req, res) => {
  try {
    const passengers = await Passenger.findAll({
      attributes: ["id", "name", "age", "gender","honorifics","bookingId", "type"],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: passengers.length,
      passengers,
    });
  } catch (error) {
    console.error("Get Passenger List Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


exports.updatePassenger = async (req, res) => {
  try {
    const { passengerId } = req.params;

    if (!passengerId) {
      return res.status(400).json({
        success: false,
        message: "passengerId is required",
      });
    }

    const { honorifics, name, age, gender } = req.body;

  
    if (!name || !gender) {
      return res.status(400).json({
        success: false,
        message: "Name and gender are required",
      });
    }

    const passenger = await Passenger.findByPk(passengerId);

    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: "Passenger not found",
      });
    }

    await passenger.update({
      honorifics: honorifics || passenger.honorifics,
      name,
      age: age ?? passenger.age,
      gender,
    });

    return res.status(200).json({
      success: true,
      message: "Passenger updated successfully",
      passenger,
    });
  } catch (err) {
    console.error("updatePassenger error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};


exports.getPassengersByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    const passengers = await Passenger.findAll({
      where: { clientId },
      attributes: [
        "id",
        "name",
        "age",
        "gender",
        "honorifics",
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      total: passengers.length,
      passengers,
    });
  } catch (error) {
    console.error("Error fetching passengers by client:", error);
    return res.status(500).json({
      message: "Failed to fetch passengers",
      error: error.message,
    });
  }
};
