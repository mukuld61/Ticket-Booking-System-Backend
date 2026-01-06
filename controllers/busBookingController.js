
const BookingBus = require("../models/bookingBusModel");
const Client = require("../models/clientModel");
const Passenger = require("../models/passengerModel");


exports.createBusBooking = async (req, res) => {

  try {
    
    const {
      clientId,
      busNumber,
      fromStop,
      toStop,
      departureDateTime,
      seatType,
      fare,
      passengerDetails, 
      bordingPoint,
      createdBy
    } = req.body;
    console.log(" Received booking data:", req.body);
    console.log("passengerDetails received:", passengerDetails);
    if (!clientId || !busNumber || !fromStop || !toStop || !departureDateTime) {
      return res.status(400).json({ message: "Required fields missing" });
    }


    const client = await Client.findByPk(clientId);
    if (!client) return res.status(404).json({ message: "Client not found" });

  
    const finalStatus = req.body.status || "Pending";
    const finalTicketStatus = req.body.ticketStatus || "Pending";

    const booking = await BookingBus.create({
      clientId,
      clientSnapshotName: client.name,
      busNumber,
      fromStop,
      toStop,
      departureDateTime,
      seatType,
      totalPassengers: passengerDetails?.length,
      bordingPoint,
      fare,
      status: finalStatus,
      ticketStatus: finalTicketStatus,
      createdBy,
        bookedBy: req.user.id,
    });




    if (Array.isArray(passengerDetails) && passengerDetails.length > 0) {
      const passengers = passengerDetails.map(p => ({
        bookingId: booking.id,
        type: "bus",
        name: p.name,
        age: p.age,
        gender: p.gender,
        honorifics: p.honorifics
      }));
      await Passenger.bulkCreate(passengers);
    }

    const bookingWithDetails = await BookingBus.findByPk(booking.id, {
      include: [
        { model: Client, as: "client", attributes: ["id", "name", "phone", "email"] },
        { model: Passenger, as: "busPassengers", attributes: ["id", "name", "age", "gender", "honorifics"] },
      ],
    });

    res.status(201).json({
      message: "Bus booking created successfully",
      booking: bookingWithDetails,
    });
  } catch (error) {
    console.error("Error creating bus booking:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


exports.getAllBusBookings = async (req, res) => {
  try {
    const bookings = await BookingBus.findAll({
      include: [
        { model: Client, as: "client", attributes: ["id", "name", "phone", "email"] },
        { model: Passenger, as: "busPassengers", attributes: ["id", "name", "age", "gender", "honorifics"] }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


exports.getBusBookingById = async (req, res) => {
  try {
    const booking = await BookingBus.findByPk(req.params.id, {
      include: [
        { model: Client, as: "client", attributes: ["id", "name", "phone", "email"] },
        { model: Passenger, as: "busPassengers", attributes: ["id", "name", "age", "gender", "honorifics"] }
      ]
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


exports.deleteBusBooking = async (req, res) => {
  try {
    const result = await BookingBus.destroy({ where: { id: req.params.id } });
    if (!result) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};







// const BookingBus = require("../models/bookingBusModel");
// const Client = require("../models/clientModel");
// const Passenger = require("../models/passengerModel");
// const TripDetails = require("../models/tripDetailsModel");

// // CREATE BUS BOOKING
// exports.createBusBooking = async (req, res) => {
//   try {
//     const {
//       clientId,
//       busNumber,
//       fromStop,
//       toStop,
//       departureDateTime,
//       returnDateTime,
//       seatType,
//       busType,
//       fare,
//       passengerDetails,
//       boardingPoint,
//       tripType,
//       tripGroupId,
//       createdBy
//     } = req.body;

//     if (!clientId || !busNumber || !fromStop || !toStop || !departureDateTime) {
//       return res.status(400).json({ message: "Required fields missing" });
//     }

//     const client = await Client.findByPk(clientId);
//     if (!client) return res.status(404).json({ message: "Client not found" });

//     const finalStatus = req.body.status || "Pending";
//     const finalTicketStatus = req.body.ticketStatus || "Pending";

//     // Auto-generate tripGroupId if not provided
//     const finalTripGroupId = tripGroupId || `TRIP${Date.now()}`;

//     // Create Bus Booking
//     const booking = await BookingBus.create({
//       clientId,
//       clientSnapshotName: client.name,
//       busNumber,
//       fromStop,
//       toStop,
//       departureDateTime,
//       returnDateTime: returnDateTime || null,
//       seatType,
//       busType: busType || null,
//       totalPassengers: passengerDetails?.length || 1,
//       boardingPoint,
//       fare,
//       tripType: tripType || "single",
//       tripGroupId: finalTripGroupId,
//       status: finalStatus,
//       ticketStatus: finalTicketStatus,
//       createdBy,
//       bookedBy: req.user.id,
//     });

//     // Create Passengers
//     if (Array.isArray(passengerDetails) && passengerDetails.length > 0) {
//       const passengers = passengerDetails.map((p) => ({
//         bookingId: booking.id,
//         type: "bus",
//         name: p.name,
//         age: p.age,
//         gender: p.gender,
//         honorifics: p.honorifics,
//         seatNumber: p.seatNumber || null,
//       }));
//       await Passenger.bulkCreate(passengers);
//     }

//     // Create TripDetails (support round trip)
//     await TripDetails.create({
//       bookingId: booking.id,
//       bookingType: "bus",
//       tripType: tripType || "single",
//       tripGroupId: finalTripGroupId,
//       departureDate: departureDateTime,
//       returnDate: returnDateTime || null,
//       busType: busType || null,
//       fromStop,
//       toStop,
//       seatType: seatType || null,
//       boardingPoint,
//     });

//     if (tripType === "round" && returnDateTime) {
//       await TripDetails.create({
//         bookingId: booking.id,
//         bookingType: "bus",
//         tripType: "return",
//         tripGroupId: finalTripGroupId,
//         departureDate: returnDateTime,
//         fromStop: toStop,
//         toStop: fromStop,
//         busType: busType || null,
//         seatType: seatType || null,
//         boardingPoint,
//       });
//     }

//     // Fetch booking with client, passengers, and trip details
//     const bookingWithDetails = await BookingBus.findByPk(booking.id, {
//       include: [
//         { model: Client, as: "client", attributes: ["id", "name", "phone", "email"] },
//         { model: Passenger, as: "busPassengers", attributes: ["id", "name", "age", "gender", "honorifics", "seatNumber"] },
//         { model: TripDetails, as: "tripDetails" },
//       ],
//     });

//     res.status(201).json({
//       message: "Bus booking created successfully",
//       booking: bookingWithDetails,
//     });
//   } catch (error) {
//     console.error("Error creating bus booking:", error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// // GET ALL BUS BOOKINGS
// exports.getAllBusBookings = async (req, res) => {
//   try {
//     const bookings = await BookingBus.findAll({
//       include: [
//         { model: Client, as: "client", attributes: ["id", "name", "phone", "email"] },
//         { model: Passenger, as: "busPassengers", attributes: ["id", "name", "age", "gender", "honorifics", "seatNumber"] },
//         { model: TripDetails, as: "tripDetails" },
//       ],
//       order: [["createdAt", "DESC"]],
//     });
//     res.status(200).json(bookings);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // GET BUS BOOKING BY ID
// exports.getBusBookingById = async (req, res) => {
//   try {
//     const booking = await BookingBus.findByPk(req.params.id, {
//       include: [
//         { model: Client, as: "client", attributes: ["id", "name", "phone", "email"] },
//         { model: Passenger, as: "busPassengers", attributes: ["id", "name", "age", "gender", "honorifics", "seatNumber"] },
//         { model: TripDetails, as: "tripDetails" },
//       ],
//     });

//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     // Format round trip details
//     let roundTrip = null;
//     if (booking.tripDetails.length > 1) {
//       const outbound = booking.tripDetails.find(t => t.tripType === "single" || t.tripType === "outbound");
//       const returnTrip = booking.tripDetails.find(t => t.tripType === "return");
//       if (returnTrip) roundTrip = { outbound, return: returnTrip };
//     }

//     res.status(200).json({
//       ...booking.toJSON(),
//       roundTrip,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // DELETE BUS BOOKING
// exports.deleteBusBooking = async (req, res) => {
//   try {
//     const result = await BookingBus.destroy({ where: { id: req.params.id } });
//     if (!result) return res.status(404).json({ message: "Booking not found" });
//     res.status(200).json({ message: "Booking deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };


// // const BookingBus = require("../models/bookingBusModel");
// // const Client = require("../models/clientModel");
// // const Passenger = require("../models/passengerModel");
// // const TripDetails = require("../models/tripDetailsModel");

// // const formatTripBus = (booking) => {
// //   const bookingJSON = booking.toJSON();
// //   if (!Array.isArray(bookingJSON.tripDetails)) {
// //     bookingJSON.roundTrip = null;
// //     bookingJSON.multiTrips = null;
// //     return bookingJSON;
// //   }

// //   const outbound = bookingJSON.tripDetails.find(t => t.tripType === "outbound");
// //   const returnTrip = bookingJSON.tripDetails.find(t => t.tripType === "return");
// //   const multiTrips = bookingJSON.tripDetails.filter(t => t.tripType === "multi");
// //   const legacyRound = bookingJSON.tripDetails.find(t => t.tripType === "round");

// //   if (outbound && returnTrip) {
// //     bookingJSON.roundTrip = { outbound, return: returnTrip };
// //   } else if (legacyRound) {
// //     bookingJSON.roundTrip = {
// //       outbound: {
// //         departureDate: legacyRound.departureDate,
// //         fromStop: legacyRound.fromStop,
// //         toStop: legacyRound.toStop,
// //         seatType: legacyRound.seatType,
// //         busType: legacyRound.busType,
// //         boardingPoint: legacyRound.boardingPoint,
// //       },
// //       return: legacyRound.returnDate
// //         ? {
// //             departureDate: legacyRound.returnDate,
// //             fromStop: legacyRound.toStop,
// //             toStop: legacyRound.fromStop,
// //             seatType: legacyRound.seatType,
// //             busType: legacyRound.busType,
// //             boardingPoint: legacyRound.boardingPoint,
// //           }
// //         : null,
// //     };
// //   } else {
// //     bookingJSON.roundTrip = null;
// //   }

// //   bookingJSON.multiTrips = multiTrips.length > 0 ? multiTrips : null;
// //   return bookingJSON;
// // };


// // exports.createBusBooking = async (req, res) => {
// //   try {
// //     const {
// //       clientId,
// //       busNumber,
// //       fromStop,
// //       toStop,
// //       departureDateTime,
// //       returnDateTime,
// //       seatType,
// //       busType,
// //       fare,
// //       passengerDetails,
// //       boardingPoint,
// //       tripType,
// //       tripGroupId,
// //       createdBy,
// //       multiTripDetails,
// //     } = req.body;

// //     if (!clientId || !busNumber || !fromStop || !toStop || !departureDateTime) {
// //       return res.status(400).json({ message: "Required fields missing" });
// //     }

// //     const client = await Client.findByPk(clientId);
// //     if (!client) return res.status(404).json({ message: "Client not found" });

// //     const finalTripGroupId = tripGroupId || `TRIP${Date.now()}`;

// //     const booking = await BookingBus.create({
// //       clientId,
// //       clientSnapshotName: client.name,
// //       busNumber,
// //       fromStop,
// //       toStop,
// //       departureDateTime,
// //       seatType,
// //       busType: busType || null,
// //       totalPassengers: passengerDetails?.length || 1,
// //       boardingPoint,
// //       fare,
// //       tripType: tripType || "single",
// //       tripGroupId: finalTripGroupId,
// //       status: "Pending",
// //       ticketStatus: "Pending",
// //       createdBy,
// //       bookedBy: req.user?.id || createdBy,
// //     });

// //     // Passengers
// //     if (Array.isArray(passengerDetails) && passengerDetails.length > 0) {
// //       const passengers = passengerDetails.map((p) => ({
// //         bookingId: booking.id,
// //         type: "bus",
// //         name: p.name,
// //         age: p.age,
// //         gender: p.gender,
// //         honorifics: p.honorifics,
// //       }));
// //       await Passenger.bulkCreate(passengers);
// //     }


// //     if (tripType === "single") {
// //       await TripDetails.create({
// //         bookingId: booking.id,
// //         bookingType: "bus",
// //         tripType: "single",
// //         tripGroupId: finalTripGroupId,
// //         departureDate: departureDateTime,
// //         fromStop,
// //         toStop,
// //         busType: busType || null,
// //         seatType: seatType || null,
// //         boardingPoint,
// //       });
// //     } else if (tripType === "round") {
   
// //       await TripDetails.create({
// //         bookingId: booking.id,
// //         bookingType: "bus",
// //         tripType: "outbound",
// //         tripGroupId: finalTripGroupId,
// //         departureDate: departureDateTime,
// //         fromStop,
// //         toStop,
// //         busType: busType || null,
// //         seatType: seatType || null,
// //         boardingPoint,
// //       });
   
// //       if (returnDateTime) {
// //         await TripDetails.create({
// //           bookingId: booking.id,
// //           bookingType: "bus",
// //           tripType: "return",
// //           tripGroupId: finalTripGroupId,
// //           departureDate: returnDateTime,
// //           fromStop: toStop,
// //           toStop: fromStop,
// //           busType: busType || null,
// //           seatType: seatType || null,
// //           boardingPoint,
// //         });
// //       }
// //     } else if (tripType === "multi" && Array.isArray(multiTripDetails)) {
// //       for (const trip of multiTripDetails) {
// //         await TripDetails.create({
// //           bookingId: booking.id,
// //           bookingType: "bus",
// //           tripType: "multi",
// //           tripGroupId: finalTripGroupId,
// //           departureDate: trip.departureDateTime,
// //           fromStop: trip.fromStop,
// //           toStop: trip.toStop,
// //           busType: trip.busType || null,
// //           seatType: trip.seatType || null,
// //           boardingPoint: trip.boardingPoint || null,
// //         });
// //       }
// //     }

  
// //     const bookingWithDetails = await BookingBus.findByPk(booking.id, {
// //       include: [
// //         { model: Client, as: "client", attributes: ["id", "name", "phone", "email"] },
// //         { model: Passenger, as: "busPassengers", attributes: ["id", "name", "age", "gender", "honorifics"] },
// //         { model: TripDetails, as: "tripDetails" },
// //       ],
// //     });

// //     return res.status(201).json({
// //       message: "Bus booking created successfully",
// //       booking: formatTripBus(bookingWithDetails),
// //     });
// //   } catch (error) {
// //     console.error("Create Bus Booking Error:", error);
// //     return res.status(500).json({
// //       message: "Server Error",
// //       error: error.message,
// //     });
// //   }
// // };

// // exports.getAllBusBookings = async (req, res) => {
// //   try {
// //     const bookings = await BookingBus.findAll({
// //       include: [
// //         {
// //           model: Client,
// //           as: "client",
// //           attributes: ["id", "name", "phone", "email"],
// //         },
// //         {
// //           model: Passenger,
// //           as: "busPassengers",
// //           attributes: ["id", "name", "age", "gender", "honorifics"],
// //         },
// //         {
// //           model: TripDetails,
// //           as: "tripDetails",
// //         },
// //       ],
// //       order: [["createdAt", "DESC"]],
// //     });

// //     const formatted = bookings.map((b) => formatRoundTripBus(b));
// //     return res.status(200).json(formatted);
// //   } catch (error) {
// //     console.error(error);
// //     return res.status(500).json({ message: error.message });
// //   }
// // };

// // exports.getBusBookingById = async (req, res) => {
// //   try {
// //     const booking = await BookingBus.findByPk(req.params.id, {
// //       include: [
// //         {
// //           model: Client,
// //           as: "client",
// //           attributes: ["id", "name", "phone", "email"],
// //         },
// //         {
// //           model: Passenger,
// //           as: "busPassengers",
// //           attributes: ["id", "name", "age", "gender", "honorifics"],
// //         },
// //         {
// //           model: TripDetails,
// //           as: "tripDetails",
// //         },
// //       ],
// //     });

// //     if (!booking) {
// //       return res.status(404).json({ message: "Booking not found" });
// //     }

// //     return res.status(200).json(formatRoundTripBus(booking));
// //   } catch (error) {
// //     console.error(error);
// //     return res.status(500).json({ message: error.message });
// //   }
// // };


// // exports.deleteBusBooking = async (req, res) => {
// //   try {
// //     const deleted = await BookingBus.destroy({
// //       where: { id: req.params.id },
// //     });

// //     if (!deleted) {
// //       return res.status(404).json({ message: "Booking not found" });
// //     }

// //     return res.status(200).json({
// //       message: "Booking deleted successfully",
// //     });
// //   } catch (error) {
// //     console.error(error);
// //     return res.status(500).json({ message: error.message });
// //   }
// // };
