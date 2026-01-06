

const BookingRail = require("../models/bookingRailModel");
const Passenger = require("../models/passengerModel");
const Client = require("../models/clientModel");

const createRailwayBooking = async (req, res) => {
  try {
    const {
      clientId,
      trainNo,
      trainName,
      pnrNumber,
      classType,
      source, 
      destination,
      travelDate,
      passengerDetails,
      boardingPoint,
      amount,
      createdBy,
    } = req.body;

    if (!clientId || !trainNo || !source || !destination || !travelDate) {
      return res.status(400).json({ message: "Required fields missing" });
    }


    const totalPassengers = passengerDetails ? passengerDetails.length : 1;

    const ticketStatus = req.body.ticketStatus || "Confirmed";
    const bookingStatus = ticketStatus === "Confirmed" ? "Confirmed" : "Pending";


    const booking = await BookingRail.create({
      clientId,
      trainNumber: trainNo,
      trainName: trainName,
      pnrNumber: pnrNumber,
      classType,
      fromStation: source,
      toStation: destination,
      departureDate: travelDate,
      totalPassengers,
     boardingPoint,
      status:bookingStatus,
      ticketStatus,
      createdBy,
      bookedBy: req.user.id,
        
    });

    if (passengerDetails && passengerDetails.length > 0) {
      const passengers = passengerDetails.map(p => ({
        bookingId: booking.id,
        type: "rail",
        name: p.name,
        age: p.age,
        gender: p.gender,
        honorifics: p.honorifics
      }));
      await Passenger.bulkCreate(passengers);
    }

  
    const bookingWithDetails = await BookingRail.findByPk(booking.id, {
      include: [
        { model: Client, as: "client", attributes: ["id", "name", "phone", "email"] },
        { model: Passenger, as: "railpassengers", attributes: ["id", "name", "age", "gender", "honorifics"] }
      ]
    });

    res.status(201).json({ message: "Railway booking created successfully", booking: bookingWithDetails });
  } catch (error) {
    console.error("Error creating railway booking:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


const getAllRailwayBookings = async (req, res) => {
  try {
    const bookings = await BookingRail.findAll({
      include: [
        { model: Client, as: "client", attributes: ["id", "name", "phone", "email"] },
        { model: Passenger, as: "railPassengers", attributes: ["id", "name", "age", "gender", "honorifics"] }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRailwayBookingById = async (req, res) => {
  try {
    const booking = await BookingRail.findByPk(req.params.id, {
      include: [
        { model: Client, as: "client", attributes: ["id", "name", "phone", "email"] },
        { model: Passenger, as: "railPassengers", attributes: ["id", "name", "age", "gender", "honorifics"] }
      ]
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteRailwayBooking = async (req, res) => {
  try {
    const result = await BookingRail.destroy({ where: { id: req.params.id } });
    if (result === 0) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRailwayBooking,
  getAllRailwayBookings,
  getRailwayBookingById,
  deleteRailwayBooking
};
