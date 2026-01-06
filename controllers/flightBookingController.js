const BookingFlight = require("../models/bookingFlightModel");
const Client = require("../models/clientModel");
const Passenger = require("../models/passengerModel");

exports.createFlightBooking = async (req, res) => {
  try {
    const {
      clientId,
      flightNumber,
      fromAirport,
      toAirport,
      departureDateTime,
      travelClass,
      fare,
      passengerDetails,
      boardingPoint,
      passengers,
      createdBy,
      clientSnapshotName,
    } = req.body;

    if (
      !clientId ||
      !flightNumber ||  
      !fromAirport ||
      !toAirport ||
      !departureDateTime
    ) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const passengerList = passengerDetails || passengers || [];

    const booking = await BookingFlight.create({
      clientId,
      clientSnapshotName: clientSnapshotName || null,
      flightNumber,
      fromAirport,
      toAirport,
      departureDateTime,
      travelClass,
      airline,
      boardingPoint,
      totalPassengers: passengerList.length || 1,
      fare,
      status: req.body.status || "Pending",
      ticketStatus: req.body.ticketStatus || "Pending",
      createdBy,
      bookedBy: req.user.id,
    });

    if (passengerList.length > 0) {
      const passengerData = passengerList.map((p) => ({
        bookingId: booking.id,
        type: "flight",
        name: p.name,
        age: p.age,
        gender: p.gender,
        honorifics: p.honorifics,
      }));
      await Passenger.bulkCreate(passengerData);
    }

    const bookingWithDetails = await BookingFlight.findByPk(booking.id, {
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["id", "name", "phone", "email", "notes"],
        },
        {
          model: Passenger,
          as: "flightPassengers",
          attributes: ["id", "name", "age", "gender", "honorifics"],
        },
      ],
    });

    res.status(201).json({
      message: " Booking created successfully for flight",
      booking: bookingWithDetails,
    });
  } catch (error) {
    console.error("Error creating flight booking:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getAllFlightBookings = async (req, res) => {
  try {
    const bookings = await BookingFlight.findAll({
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["id", "name", "phone", "email", "notes"],
        },
        {
          model: Passenger,
          as: "flightPassengers",
          attributes: ["id", "name", "age", "gender", "honorifics"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getFlightBookingById = async (req, res) => {
  try {
    const booking = await BookingFlight.findByPk(req.params.id, {
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["id", "name", "phone", "email"],
        },
        {
          model: Passenger,
          as: "flightPassengers",
          attributes: ["id", "name", "age", "gender", "honorifics"],
        },
      ],
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFlightBooking = async (req, res) => {
  try {
    const result = await BookingFlight.destroy({
      where: { id: req.params.id },
    });
    if (!result) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};



// const BookingFlight = require("../models/bookingFlightModel");
// const Client = require("../models/clientModel");
// const Passenger = require("../models/passengerModel");
// const TripDetails = require("../models/tripDetailsModel");

// // Create Flight Booking
// exports.createFlightBooking = async (req, res) => {
//   try {
//     const {
//       clientId,
//       flightNumber,
//       fromAirport,
//       toAirport,
//       departureDateTime,
//       returnDateTime,
//       travelClass,
//       fare,
//       passengerDetails,
//       passengers,
//       boardingPoint,
//       tripType,
//       tripGroupId,
//       createdBy,
//       clientSnapshotName,
//       airline,
//       status,
//       ticketStatus,
//     } = req.body;

//     if (!clientId || !flightNumber || !fromAirport || !toAirport || !departureDateTime) {
//       return res.status(400).json({ message: "Required fields missing" });
//     }

//     const passengerList = passengerDetails || passengers || [];
//     const finalTripType = tripType || "single";
//     const finalTripGroupId = tripGroupId || `TRIP${Date.now()}`;

//     // Create Flight Booking
//     const booking = await BookingFlight.create({
//       clientId,
//       clientSnapshotName: clientSnapshotName || null,
//       flightNumber,
//       fromAirport,
//       toAirport,
//       departureDateTime,
//       travelClass,
//       airline,
//       boardingPoint,
//       tripType: finalTripType,
//       tripGroupId: finalTripGroupId,
//       totalPassengers: passengerList.length || 0,
//       fare,
//       status: status || "Pending",
//       ticketStatus: ticketStatus || "Pending",
//       createdBy,
//       bookedBy: req.user.id,
//     });

//     // Create passengers
//     if (passengerList.length > 0) {
//       const passengerData = passengerList.map((p) => ({
//         bookingId: booking.id,
//         type: "flight",
//         name: p.name,
//         age: p.age,
//         gender: p.gender,
//         honorifics: p.honorifics,
//       }));
//       await Passenger.bulkCreate(passengerData);
//     }

//     // Create TripDetails
//     if (finalTripType === "round" && returnDateTime) {
//       // Outbound flight
//       await TripDetails.create({
//         bookingId: booking.id,
//         bookingType: "flight",
//         tripType: finalTripType,
//         tripGroupId: finalTripGroupId,
//         departureDate: departureDateTime,
//         returnDate: null,
//         airline,
//         flightNumber,
//         fromAirport,
//         toAirport,
//         travelClass,
//         boardingPoint,
//       });

//       // Return flight
//       await TripDetails.create({
//         bookingId: booking.id,
//         bookingType: "flight",
//         tripType: finalTripType,
//         tripGroupId: finalTripGroupId,
//         departureDate: returnDateTime,
//         returnDate: null,
//         airline,
//         flightNumber: `${flightNumber}-R`,
//         fromAirport: toAirport,
//         toAirport: fromAirport,
//         travelClass,
//         boardingPoint,
//       });
//     } else {
//       // Single flight
//       await TripDetails.create({
//         bookingId: booking.id,
//         bookingType: "flight",
//         tripType: finalTripType,
//         tripGroupId: finalTripGroupId,
//         departureDate: departureDateTime,
//         returnDate: returnDateTime || null,
//         airline,
//         flightNumber,
//         fromAirport,
//         toAirport,
//         travelClass,
//         boardingPoint,
//       });
//     }

//     // Fetch Booking with Client, Passengers, and TripDetails
//     const bookingWithDetails = await BookingFlight.findByPk(booking.id, {
//       include: [
//         { model: Client, as: "client", attributes: ["id", "name", "phone", "email", "notes"] },
//         { model: Passenger, as: "flightPassengers", attributes: ["id", "name", "age", "gender", "honorifics"] },
//         { model: TripDetails, as: "tripDetails" },
//       ],
//     });

//     res.status(201).json({
//       message: "Booking created successfully for flight",
//       booking: bookingWithDetails,
//     });
//   } catch (error) {
//     console.error("Error creating flight booking:", error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// // Get All Flight Bookings
// exports.getAllFlightBookings = async (req, res) => {
//   try {
//     const bookings = await BookingFlight.findAll({
//       include: [
//         { model: Client, as: "client", attributes: ["id", "name", "phone", "email", "notes"] },
//         { model: Passenger, as: "flightPassengers", attributes: ["id", "name", "age", "gender", "honorifics"] },
//         { model: TripDetails, as: "tripDetails" },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     // Format round-trip info
//     const formattedBookings = bookings.map((b) => {
//       const outbound = b.tripDetails.find(t => t.flightNumber === b.flightNumber);
//       const inbound = b.tripDetails.find(t => t.flightNumber === `${b.flightNumber}-R`) || null;

//       return {
//         ...b.toJSON(),
//         roundTrip: inbound ? { outbound, return: inbound } : null,
//       };
//     });

//     res.status(200).json(formattedBookings);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get Flight Booking by ID
// exports.getFlightBookingById = async (req, res) => {
//   try {
//     const booking = await BookingFlight.findByPk(req.params.id, {
//       include: [
//         { model: Client, as: "client", attributes: ["id", "name", "phone", "email"] },
//         { model: Passenger, as: "flightPassengers", attributes: ["id", "name", "age", "gender", "honorifics"] },
//         { model: TripDetails, as: "tripDetails" },
//       ],
//     });
//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     const outbound = booking.tripDetails.find(t => t.flightNumber === booking.flightNumber);
//     const inbound = booking.tripDetails.find(t => t.flightNumber === `${booking.flightNumber}-R`) || null;

//     const response = {
//       ...booking.toJSON(),
//       roundTrip: inbound ? { outbound, return: inbound } : null,
//     };

//     res.status(200).json(response);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // Delete Flight Booking
// exports.deleteFlightBooking = async (req, res) => {
//   try {
//     const result = await BookingFlight.destroy({ where: { id: req.params.id } });
//     if (!result) return res.status(404).json({ message: "Booking not found" });
//     res.status(200).json({ message: "Booking deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // const BookingFlight = require("../models/bookingFlightModel");
// // const Client = require("../models/clientModel");
// // const Passenger = require("../models/passengerModel");
// // const TripDetails = require("../models/tripDetailsModel");


// // const formatTripFlight = (booking) => {
// //   if (!booking.tripDetails || booking.tripDetails.length === 0) return booking;

// //   const roundTrip = booking.tripDetails.find(t => t.tripType === "round" || t.tripType === "return");
// //   const multiTrips = booking.tripDetails.filter(t => t.tripType === "multi");

// //   booking.roundTrip = roundTrip
// //     ? {
// //         flightNumber: roundTrip.flightNumber,
// //         fromAirport: roundTrip.toAirport,
// //         toAirport: roundTrip.fromAirport,
// //         departureDateTime: roundTrip.returnDate,
// //         airline: roundTrip.airline,
// //         travelClass: roundTrip.travelClass,
// //         boardingPoint: roundTrip.boardingPoint,
// //       }
// //     : null;

// //   booking.multiTrips = multiTrips.length > 0 ? multiTrips : null;

// //   return booking;
// // };


// // exports.createFlightBooking = async (req, res) => {
// //   try {
// //     const {
// //       clientId,
// //       flightNumber,
// //       fromAirport,
// //       toAirport,
// //       departureDateTime,
// //       returnDateTime,
// //       travelClass,
// //       fare,
// //       passengerDetails,
// //       boardingPoint,
// //       tripType,
// //       tripGroupId,
// //       createdBy,
// //       clientSnapshotName,
// //       airline,
// //       multiTripDetails 
// //     } = req.body;

// //     if (!clientId || !fromAirport || !toAirport || !departureDateTime) {
// //       return res.status(400).json({ message: "Required fields missing" });
// //     }

// //     const passengerList = passengerDetails || [];

// //     const finalTripGroupId = tripGroupId || `TRIP${Date.now()}`;


// //     const booking = await BookingFlight.create({
// //       clientId,
// //       clientSnapshotName: clientSnapshotName || null,
// //       flightNumber: flightNumber || null,
// //       fromAirport,
// //       toAirport,
// //       departureDateTime,
// //       travelClass: travelClass || null,
// //       airline: airline || null,
// //       boardingPoint: boardingPoint || null,
// //       tripType: tripType || "single",
// //       tripGroupId: finalTripGroupId,
// //       totalPassengers: passengerList.length || 1,
// //       fare: fare || null,
// //       status: req.body.status || "Pending",
// //       ticketStatus: req.body.ticketStatus || "Pending",
// //       createdBy,
// //       bookedBy: req.user.id,
// //     });


// //     if (passengerList.length > 0) {
// //       const passengerData = passengerList.map(p => ({
// //         bookingId: booking.id,
// //         type: "flight",
// //         name: p.name,
// //         age: p.age,
// //         gender: p.gender,
// //         honorifics: p.honorifics,
// //       }));
// //       await Passenger.bulkCreate(passengerData);
// //     }

  
// //     if (tripType === "single") {
// //       await TripDetails.create({
// //         bookingId: booking.id,
// //         bookingType: "flight",
// //         tripType: "single",
// //         tripGroupId: finalTripGroupId,
// //         departureDate: departureDateTime,
// //         returnDate: null,
// //         airline,
// //         flightNumber,
// //         fromAirport,
// //         toAirport,
// //         travelClass,
// //         boardingPoint,
// //       });
// //     } else if (tripType === "round") {
     
// //       await TripDetails.create({
// //         bookingId: booking.id,
// //         bookingType: "flight",
// //         tripType: "outbound",
// //         tripGroupId: finalTripGroupId,
// //         departureDate: departureDateTime,
// //         returnDate: returnDateTime || null,
// //         airline,
// //         flightNumber,
// //         fromAirport,
// //         toAirport,
// //         travelClass,
// //         boardingPoint,
// //       });
      
// //       if (returnDateTime) {
// //         await TripDetails.create({
// //           bookingId: booking.id,
// //           bookingType: "flight",
// //           tripType: "return",
// //           tripGroupId: finalTripGroupId,
// //           departureDate: returnDateTime,
// //           fromAirport: toAirport,
// //           toAirport: fromAirport,
// //           airline,
// //           flightNumber,
// //           travelClass,
// //           boardingPoint,
// //         });
// //       }
// //     } else if (tripType === "multi" && Array.isArray(multiTripDetails)) {
// //       for (const trip of multiTripDetails) {
// //         await TripDetails.create({
// //           bookingId: booking.id,
// //           bookingType: "flight",
// //           tripType: "multi",
// //           tripGroupId: finalTripGroupId,
// //           departureDate: trip.departureDateTime,
// //           returnDate: trip.returnDateTime || null,
// //           airline: trip.airline,
// //           flightNumber: trip.flightNumber,
// //           fromAirport: trip.fromAirport,
// //           toAirport: trip.toAirport,
// //           travelClass: trip.travelClass,
// //           boardingPoint: trip.boardingPoint,
// //         });
// //       }
// //     }

   
// //     const bookingWithDetails = await BookingFlight.findByPk(booking.id, {
// //       include: [
// //         { model: Client, as: "client", attributes: ["id", "name", "phone", "email", "notes"] },
// //         { model: Passenger, as: "flightPassengers", attributes: ["id", "name", "age", "gender", "honorifics"] },
// //         { model: TripDetails, as: "tripDetails" },
// //       ],
// //     });

// //     res.status(201).json({
// //       message: "Booking created successfully for flight",
// //       booking: formatTripFlight(bookingWithDetails.toJSON()),
// //     });
// //   } catch (error) {
// //     console.error("Error creating flight booking:", error);
// //     res.status(500).json({ message: "Server Error", error: error.message });
// //   }
// // };


// // exports.getAllFlightBookings = async (req, res) => {
// //   try {
// //     const bookings = await BookingFlight.findAll({
// //       include: [
// //         { model: Client, as: "client", attributes: ["id", "name", "phone", "email", "notes"] },
// //         { model: Passenger, as: "flightPassengers", attributes: ["id", "name", "age", "gender", "honorifics"] },
// //         { model: TripDetails, as: "tripDetails" },
// //       ],
// //       order: [["createdAt", "DESC"]],
// //     });

// //     const formattedBookings = bookings.map((b) => formatTripFlight(b.toJSON()));

// //     res.status(200).json(formattedBookings);
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ message: error.message });
// //   }
// // };


// // exports.getFlightBookingById = async (req, res) => {
// //   try {
// //     const booking = await BookingFlight.findByPk(req.params.id, {
// //       include: [
// //         { model: Client, as: "client", attributes: ["id", "name", "phone", "email", "notes"] },
// //         { model: Passenger, as: "flightPassengers", attributes: ["id", "name", "age", "gender", "honorifics"] },
// //         { model: TripDetails, as: "tripDetails" },
// //       ],
// //     });

// //     if (!booking) return res.status(404).json({ message: "Booking not found" });

// //     res.status(200).json(formatRoundTrip(booking.toJSON()));
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ message: error.message });
// //   }
// // };

// // exports.deleteFlightBooking = async (req, res) => {
// //   try {
// //     const result = await BookingFlight.destroy({ where: { id: req.params.id } });
// //     if (!result) return res.status(404).json({ message: "Booking not found" });
// //     res.status(200).json({ message: "Booking deleted successfully" });
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ message: error.message });
// //   }
// // };
