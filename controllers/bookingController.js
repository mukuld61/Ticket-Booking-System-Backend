const { Op } = require("sequelize");
const Client = require("../models/clientModel");
const BookingBus = require("../models/bookingBusModel");
const BookingFlight = require("../models/bookingFlightModel");
const BookingRail = require("../models/bookingRailModel");
const Passenger = require("../models/passengerModel");
const Ledger = require("../models/ledgerModel");
const Company = require("../models/companyModel");
const BookingUpdate = require("../models/bookingUpdateModel");
const userModel = require("../models/userModel");
const BookingTrip = require("../models/bookingTrip");
// const TripDetails = require("../models/tripDetailsModel");

exports.createBooking = async (req, res) => {
  console.log("hello", req.body);
  const tripType = req.body.tripType;
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not logged in" });
    }
    const { client, booking, type, createdBy } = req.body;
    if (!client || !booking || !type) {
      return res.status(400).json({ message: "Required data missing" });
    }

    let clientRecord = await Client.findOne({
      where: { name: client.name, phone: client.phone },
    });

    if (!clientRecord) {
      clientRecord = await Client.create({ ...client, createdBy });
    } else {
      console.log(" Existing client found:", clientRecord.dataValues);
    }

    const clientId = clientRecord.id;
    const clientSnapshotName = client.name;

    let companyRecord = null;

    if (booking.company && booking.company.name) {
      companyRecord = await Company.findOne({
        where: {
          name: booking.company.name,
          gstNumber: booking.company.gstNumber || null,
        },
      });

      if (!companyRecord) {
        companyRecord = await Company.create({
          name: booking.company.name,
          alias: booking.company.alias || null,
          gstNumber: booking.company.gstNumber || null,
          panNumber: booking.company.panNumber || null,
          contactPerson: booking.company.contactPerson || null,
          phone: booking.company.phone || null,
          email: booking.company.email || null,
          addressLine1: booking.company.addressLine1 || null,
          city: booking.company.city || null,
          state: booking.company.state || null,
          postalCode: booking.company.postalCode || null,
          country: booking.company.country || "India",
          bankName: booking.company.bankName || null,
          bankAccountNumber: booking.company.bankAccountNumber || null,
          ifsc: booking.company.ifsc || null,
          commissionPercent: booking.company.commissionPercent || 0,
          settlementCycle: booking.company.settlementCycle || "Monthly",
          createdBy: req.user.id,
        });
        console.log(" New company created:", companyRecord.dataValues);
      } else {
        console.log("Existing company found:", companyRecord.dataValues);
      }
    }

    const companyId = companyRecord ? companyRecord.id : null;

    let bookingRecord;

    if (type === "bus") {
      console.log(" Creating Bus Booking with data:", booking);
      bookingRecord = await BookingBus.create({
        clientId,
        clientSnapshotName,
        createdBy,
        busNumber: booking.busNumber,
        fromStop: booking.fromStop,
        toStop: booking.toStop,
        departureDateTime: booking.departureDateTime,
        seatType: booking.seatType,
        totalPassengers: booking.passengers?.length || 1,
        boardingPoint: booking.boardingPoint,
        bookedBy: req.user.id,
        companyType: booking.companyType,
        busType: booking.busType,
        tripType: req.body.tripType, 
        seatNumber: booking.seatNumber,
        companyId,
      });
    } else if (type === "flight") {
      console.log(" Creating Flight Booking with data:", booking);
      bookingRecord = await BookingFlight.create({
        clientId,
        clientSnapshotName,
        createdBy,
        flightNumber: booking.flightNumber,
        fromAirport: booking.fromAirport,
        toAirport: booking.toAirport,
        airline: booking.airline,
        boardingPoint: booking.boardingPoint,
        departureDateTime: booking.departureDateTime,
        travelClass: booking.travelClass,
        tripType: req.body.tripType,
        totalPassengers: booking.passengers?.length || 1,
        bookedBy: req.user.id,
        companyId,
      });
    } else if (type === "rail") {
      console.log(" Creating Rail Booking with data:", booking);
      bookingRecord = await BookingRail.create({
        clientId,
        clientSnapshotName,
        createdBy,
        trainNumber: booking.trainNumber,
        trainName: booking.trainName,
        classType: booking.classType,
        fromStation: booking.fromStation,
        toStation: booking.toStation,
        departureDate: booking.departureDate,
        totalPassengers: booking.passengers?.length || 1,
        boardingPoint: booking.boardingPoint,
        bookedBy: req.user.id,
        companyId,
      });
    } else {
      return res.status(400).json({ message: "Invalid booking type" });
    }

    console.log(" Booking Record Created:", bookingRecord.dataValues);
    if (bookingRecord && bookingRecord.id) {
      await Passenger.destroy({ where: { bookingId: bookingRecord.id, type } });
    } else {
      console.log(" Skipping passenger deletion: bookingRecord.id undefined");
    }
    if (tripType === "round") {
      const roundTrip = req.body.roundTrip;
      console.log(roundTrip);

      await BookingTrip.create({
        bookingId: bookingRecord.id,
        bookingType: type,
        fromLocation: roundTrip.from,
        toLocation: roundTrip.to,
        boardingPoint: roundTrip.bording || roundTrip.boardingPoint,
        journeyDate: roundTrip.departureDate,
        airline: roundTrip.airline || "",
        travelClass: roundTrip.flightClass || "",
        seatNumber: roundTrip.seatNumbers || "",
        seatType: roundTrip.seatType || "",
        busType: roundTrip.busType || "",
      });
    }
    if(tripType==="multi"){
      const multiTripDetails = req.body.multipleTripDetails;
      for(const trip of multiTripDetails){
        await BookingTrip.create({
        bookingId: bookingRecord.id,
        bookingType: type,
        fromLocation: trip.from,
        toLocation: trip.to,
        boardingPoint: trip.boardingPoint,
        journeyDate: trip.departureDate,
        airline: trip.airline || "",
        travelClass: trip.flightClass || "",
        seatNumber: trip.seatNumbers || "",
        seatType: trip.seatType || "",
        busType: trip.busType || "",
        })
      }
    }
    if (booking.passengers && booking.passengers.length > 0) {
      console.log(" Passenger Details to Save:", booking.passengers);
      const passengerData = booking.passengers.map((p) => ({
        bookingId: bookingRecord.id,
        type,
        clientId: clientId,
        name: p.name,
        age: p.age,
        gender: p.gender,
        honorifics: p.honorifics,
      }));
      console.log(" Final Passenger Data Before Save:", passengerData);
      await Passenger.bulkCreate(passengerData);
      console.log(" Passenger Records Created Successfully");
    } else {
      console.log(" No passengers provided in request");
    }

    res.status(201).json({
      message: `Booking created successfully for ${type}`,
      booking: bookingRecord,
    });
  } catch (error) {
    console.error(" Error in createBooking Controller:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { client, booking } = req.body;
    const { tripType } = req.body;
    if (!client || !booking) {
      return res.status(400).json({ message: "Missing data" });
    }

    let BookingModel;

    if (type === "bus") BookingModel = BookingBus;
    else if (type === "rail") BookingModel = BookingRail;
    else if (type === "flight") BookingModel = BookingFlight;
    else return res.status(400).json({ message: "Invalid booking type" });

    const bookingRecord = await BookingModel.findByPk(id);

    if (!bookingRecord) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await Client.update(
      {
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address,
      },
      { where: { id: bookingRecord.clientId } }
    );

    const updatedBooking = await bookingRecord.update({
      ...booking,
      tripType: tripType,
      clientSnapshotName: client.name,
    });

    if (booking.passengers && booking.passengers.length > 0) {
      await Passenger.destroy({ where: { bookingId: id, type: type } });
      const passengersFormatted = booking.passengers.map((p) => ({
        bookingId: id,
        type: type,
        clientId: bookingRecord.clientId,
        name: p.name,
        age: p.age,
        gender: p.gender,
        honorifics: p.honorifics,
      }));

      await Passenger.bulkCreate(passengersFormatted);
    }

    if (booking.totalAmount) {
      await Ledger.update(
        { amount: booking.totalAmount },
        {
          where: {
            bookingId: id,
            bookingType: type,
          },
        }
      );
    }
    await BookingTrip.destroy({
        where: [{ bookingId: id, bookingType:type }],
      });

    if (tripType === "round") {
      const roundTrip = req.body.roundTrip;
       await BookingTrip.create({
        bookingId: id,
        bookingType: type,
        fromLocation: roundTrip.from,
        toLocation: roundTrip.to,
        boardingPoint: roundTrip.bording || roundTrip.boardingPoint,
        journeyDate: roundTrip.departureDate,
        airline: roundTrip.airline || "",
        travelClass: roundTrip.flightClass || "",
        seatNumber: roundTrip.seatNumbers || "",
        seatType: roundTrip.seatType || "",
        busType: roundTrip.busType || "",
      });
    }
     if(tripType==="multi"){
      const multiTripDetails = req.body.multipleTripDetails;
      for(const trip of multiTripDetails){
        await BookingTrip.create({
        bookingId: bookingRecord.id,
        bookingType: type,
        fromLocation: trip.from,
        toLocation: trip.to,
        boardingPoint: trip.boardingPoint,
        journeyDate: trip.departureDate,
       airline: trip.airline || "",
        travelClass: trip.flightClass || "",
        seatNumber: trip.seatNumbers || "",
        seatType: trip.seatType || "",
        busType: trip.busType || "",
        })
      }
    }
    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.searchClients = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const terms = query.split(" ").filter(Boolean);

    const searchConditions = terms.map((term) => ({
      [Op.or]: [
        { name: { [Op.like]: `%${term}%` } },
        { phone: { [Op.like]: `%${term}%` } },
      ],
    }));

    const clients = await Client.findAll({
      where: { [Op.and]: searchConditions },
      limit: 10,
    });

    res.status(200).json(clients);
  } catch (error) {
    console.error(" Error searching clients:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getConfirmedBookings = async (req, res) => {
  //new change on 17 dec
  try {
    const { role, id: userId } = req.user;

    const isAgent = role?.toLowerCase() === "agent";
    const bookedByFilter = isAgent ? { bookedBy: userId } : {};

    const bookingUpdate = await BookingUpdate.findAll({
      include: [
        {
          model: userModel,
          as: "updater",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    const [busBookings, railBookings, flightBookings] = await Promise.all([
      BookingBus.findAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { ticketStatus: "Confirmed" },
                { ticketStatus: "Waiting" },
              ],
            },
            bookedByFilter,
          ],
        },
        include: [{ model: Client, as: "client", attributes: ["name"] }],
        order: [["updatedAt", "DESC"]],
      }),

      BookingRail.findAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { ticketStatus: "Confirmed" },
                { ticketStatus: "Waiting" },
              ],
            },
            bookedByFilter,
          ],
        },
        include: [{ model: Client, as: "client", attributes: ["name"] }],
        order: [["updatedAt", "DESC"]],
      }),

      BookingFlight.findAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { ticketStatus: "Confirmed" },
                { ticketStatus: "Waiting" },
              ],
            },
            bookedByFilter,
          ],
        },
        include: [{ model: Client, as: "client", attributes: ["name"] }],
        order: [["updatedAt", "DESC"]],
      }),
    ]);

    const bookingUpdateMap = {};
    for (const bu of bookingUpdate) {
      bookingUpdateMap[`${bu.bookingType}_${bu.bookingId}`] = bu;
    }

    // const allBookings = [
    //   ...busBookings.map((b) => {
    //     const bu = bookingUpdateMap[`bus_${b.id}`];
    //     return {
    //       bookingId: b.id,
    //       clientName: b.client?.name || "Unknown",
    //       type: "Bus",
    //       // pnrNumber: b.pnrNumber || "N/A",
    //       pnrNumber: bu?.pnrNumber || b.pnrNumber || "N/A",

    //       journeyDate: bu?.journeyDate || "N/A",
    //       route:
    //         b.fromStop && b.toStop
    //           ? `${b.fromStop} - ${b.toStop}`
    //           : b.route || "N/A",
    //       ticketStatus: b.ticketStatus,
    //       amount: b.totalAmount ?? null,
    //       bookingDate: b.createdAt,
    //       updatedBy: bu?.updater?.name || "Unknown",
    //     };
    //   }),

    //   ...railBookings.map((r) => {
    //     const bu = bookingUpdateMap[`rail_${r.id}`];
    //     return {
    //       bookingId: r.id,
    //       clientName: r.client?.name || "Unknown",
    //       type: "Rail",
    //       pnrNumber: bu?.pnrNumber || r.pnrNumber || "N/A",
    //       journeyDate: bu?.journeyDate || "N/A",
    //       route:
    //         r.fromStation && r.toStation
    //           ? `${r.fromStation} - ${r.toStation}`
    //           : r.route || "N/A",
    //       ticketStatus: r.ticketStatus,
    //       amount: r.totalAmount ?? null,
    //       bookingDate: r.createdAt,
    //       updatedBy: bu?.updater?.name || "Unknown",
    //     };
    //   }),

    //   ...flightBookings.map((f) => {
    //     const bu = bookingUpdateMap[`flight_${f.id}`];
    //     return {
    //       bookingId: f.id,
    //       clientName: f.client?.name || "Unknown",
    //       type: "Flight",
    //       pnrNumber: bu?.pnrNumber || f.pnrNumber || "N/A",
    //       journeyDate: bu?.journeyDate || "N/A",
    //       route:
    //         f.fromAirport && f.toAirport
    //           ? `${f.fromAirport} - ${f.toAirport}`
    //           : f.route || "N/A",
    //       ticketStatus: f.ticketStatus,
    //       amount: f.totalAmount ?? null,
    //       bookingDate: f.createdAt,
    //       updatedBy: bu?.updater?.name || "Unknown",
    //     };
    //   }),
    // ];

    const allBookings = [
  ...busBookings.map((b) => {
    const bu = bookingUpdateMap[`bus_${b.id}`];
    return {
      bookingId: b.id,
      clientName: b.client?.name || "Unknown",
      type: "Bus",
      pnrNumber: bu?.pnrNumber || b.pnrNumber || "N/A",
      journeyDate: bu?.journeyDate || "N/A",
      route:
        b.fromStop && b.toStop
          ? `${b.fromStop} - ${b.toStop}`
          : b.route || "N/A",
      ticketStatus: b.ticketStatus,
      amount: b.totalAmount ?? null,
      bookingDate: b.createdAt,
      updatedBy: bu?.updater?.name || "Unknown",
    };
  }),

  ...railBookings.map((r) => {
    const bu = bookingUpdateMap[`rail_${r.id}`];
    return {
      bookingId: r.id,
      clientName: r.client?.name || "Unknown",
      type: "Rail",
      pnrNumber: bu?.pnrNumber || r.pnrNumber || "N/A",
      journeyDate: bu?.journeyDate || "N/A",
      route:
        r.fromStation && r.toStation
          ? `${r.fromStation} - ${r.toStation}`
          : r.route || "N/A",
      ticketStatus: r.ticketStatus,
      amount: r.totalAmount ?? null,
      bookingDate: r.createdAt,
      updatedBy: bu?.updater?.name || "Unknown",
    };
  }),

  ...flightBookings.map((f) => {
    const bu = bookingUpdateMap[`flight_${f.id}`];
    return {
      bookingId: f.id,
      clientName: f.client?.name || "Unknown",
      type: "Flight",
      pnrNumber: bu?.pnrNumber || f.pnrNumber || "N/A",
      journeyDate: bu?.journeyDate || "N/A",
      route:
        f.fromAirport && f.toAirport
          ? `${f.fromAirport} - ${f.toAirport}`
          : f.route || "N/A",
      ticketStatus: f.ticketStatus,
      amount: f.totalAmount ?? null,
      bookingDate: f.createdAt,
      updatedBy: bu?.updater?.name || "Unknown",
    };
  }),
];


// allBookings.sort(
//   (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
// );

    return res.status(200).json({
      success: true,
      count: allBookings.length,
      bookings: allBookings,
    });
  } catch (error) {
    console.error("Error fetching confirmed bookings:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getConfirmedBookingById = async (req, res) => {
  try {
    const { type, bookingId } = req.params;

    let bookingModel;
    if (type === "bus") bookingModel = BookingBus;
    else if (type === "rail") bookingModel = BookingRail;
    else if (type === "flight") bookingModel = BookingFlight;
    else return res.status(400).json({ message: "Invalid booking type" });

    const booking = await bookingModel.findOne({
      where: {
        id: bookingId,
        ticketStatus: { [Op.eq]: "Confirmed" || "Waiting" },
      },
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({ message: "Confirmed booking not found" });
    }

    let route = "N/A";
    if (type === "bus")
      route =
        booking.fromStop && booking.toStop
          ? `${booking.fromStop} - ${booking.toStop}`
          : booking.route;
    if (type === "rail")
      route =
        booking.fromStation && booking.toStation
          ? `${booking.fromStation} - ${booking.toStation}`
          : booking.route;
    if (type === "flight")
      route =
        booking.fromAirport && booking.toAirport
          ? `${booking.fromAirport} - ${booking.toAirport}`
          : booking.route;

    const response = {
      bookingId: booking.id,
      type: type.charAt(0).toUpperCase() + type.slice(1),
      ticketStatus: booking.ticketStatus,
      amount: booking.totalAmount ?? null,
      totalAmount: booking.totalAmount ?? null,
      bookingDate: booking.createdAt,
      route,
      client: booking.client,
      passengers: booking.passengerDetails ?? null,
      companyId: booking.companyId ?? null,
    };

    return res.status(200).json({ success: true, booking: response });
  } catch (err) {
    console.error("Error fetching confirmed booking by ID:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// const { Op } = require("sequelize");
// const Client = require("../models/clientModel");
// const BookingBus = require("../models/bookingBusModel");
// const BookingFlight = require("../models/bookingFlightModel");
// const BookingRail = require("../models/bookingRailModel");
// const Passenger = require("../models/passengerModel");
// const Ledger = require("../models/ledgerModel");
// const Company = require("../models/companyModel");
// const TripDetails = require("../models/tripDetailsModel");

// exports.createBooking = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ message: "User not logged in" });
//     }

//     const { client, booking, type, createdBy, tripType, tripGroupId } = req.body;

//     if (!client || !booking || !type) {
//       return res.status(400).json({ message: "Required data missing" });
//     }

//     // --- CLIENT ---
//     let clientRecord = await Client.findOne({
//       where: { name: client.name, phone: client.phone },
//     });
//     if (!clientRecord) {
//       clientRecord = await Client.create({ ...client, createdBy });
//     }
//     const clientId = clientRecord.id;
//     const clientSnapshotName = client.name;

//     // --- TRIP GROUP ID ---
//     const finalTripGroupId = tripGroupId || `TRIP${Date.now()}`;

//     // --- PASSENGERS ---
//     const passengersArray = booking?.passengers || req.body.passengers || [];
//     const passengersCount = passengersArray.length || 1;

//     // --- BOOKING ---
//     let bookingRecord;

//     switch (type) {
//       case "flight":
//         // MULTI TRIP
//         if (tripType === "multi" && Array.isArray(booking.multiTripDetails)) {
//           const allBookings = [];
//           for (const trip of booking.multiTripDetails) {
//             const flightBooking = await BookingFlight.create({
//               clientId,
//               clientSnapshotName,
//               createdBy,
//               flightNumber: trip.flightNumber,
//               fromAirport: trip.fromAirport,
//               toAirport: trip.toAirport,
//               airline: trip.airline,
//               boardingPoint: trip.boardingPoint,
//               departureDateTime: trip.departureDateTime,
//               returnDateTime: trip.returnDateTime || null,
//               travelClass: trip.travelClass,
//               totalPassengers: passengersCount,
//               bookedBy: req.user.id,
//               tripType,
//               tripGroupId: finalTripGroupId,
//               status: booking.status || "Pending",
//               ticketStatus: booking.ticketStatus || "Pending",
//               fare: trip.fare || booking.fare || null,
//             });

//             // passengers
//             if (passengersArray.length > 0) {
//               const passengerData = passengersArray.map((p) => ({
//                 bookingId: flightBooking.id,
//                 type: "flight",
//                 name: p.name,
//                 age: p.age,
//                 gender: p.gender,
//                 honorifics: p.honorifics,
//               }));
//               await Passenger.bulkCreate(passengerData);
//             }

//             // trip details
//             await TripDetails.create({
//               bookingId: flightBooking.id,
//               bookingType: "flight",
//               tripType,
//               tripGroupId: finalTripGroupId,
//               departureDate: trip.departureDateTime,
//               returnDate: trip.returnDateTime || null,
//               airline: trip.airline,
//               flightNumber: trip.flightNumber,
//               fromAirport: trip.fromAirport,
//               toAirport: trip.toAirport,
//               travelClass: trip.travelClass,
//               boardingPoint: trip.boardingPoint,
//             });

//             allBookings.push(flightBooking);
//           }

//           return res.status(201).json({
//             message: "Multi-flight booking created successfully",
//             bookings: allBookings,
//           });
//         }

//         // SINGLE or ROUND TRIP
//         bookingRecord = await BookingFlight.create({
//           clientId,
//           clientSnapshotName,
//           createdBy,
//           flightNumber: booking.flightNumber,
//           fromAirport: booking.fromAirport,
//           toAirport: booking.toAirport,
//           airline: booking.airline,
//           boardingPoint: booking.boardingPoint,
//           departureDateTime: booking.departureDateTime,
//           returnDateTime: booking.returnDateTime || null,
//           travelClass: booking.travelClass,
//           totalPassengers: passengersCount,
//           bookedBy: req.user.id,
//           tripType: tripType || "single",
//           tripGroupId: finalTripGroupId,
//           status: booking.status || "Pending",
//           ticketStatus: booking.ticketStatus || "Pending",
//           fare: booking.fare || null,
//         });
//         break;

//       case "bus":
//         bookingRecord = await BookingBus.create({
//           clientId,
//           clientSnapshotName,
//           createdBy,
//           busNumber: booking.busNumber,
//           fromStop: booking.fromStop,
//           toStop: booking.toStop,
//           departureDateTime: booking.departureDateTime,
//           returnDateTime: booking.returnDateTime || null,
//           seatType: booking.seatType,
//           busType: booking.busType || null,
//           totalPassengers: passengersCount,
//           boardingPoint: booking.boardingPoint,
//           bookedBy: req.user.id,
//           tripType: tripType || "single",
//           tripGroupId: finalTripGroupId,
//           status: booking.status || "Pending",
//           ticketStatus: booking.ticketStatus || "Pending",
//           fare: booking.fare || null,
//         });
//         break;

//       case "rail":
//         bookingRecord = await BookingRail.create({
//           clientId,
//           clientSnapshotName,
//           createdBy,
//           trainNumber: booking.trainNumber,
//           trainName: booking.trainName,
//           classType: booking.classType,
//           fromStation: booking.fromStation,
//           toStation: booking.toStation,
//           departureDate: booking.departureDate,
//           returnDate: booking.returnDate || null,
//           totalPassengers: passengersCount,
//           boardingPoint: booking.boardingPoint,
//           bookedBy: req.user.id,
//           tripType: tripType || "single",
//           tripGroupId: finalTripGroupId,
//           status: booking.status || "Pending",
//           ticketStatus: booking.ticketStatus || "Pending",
//           fare: booking.fare || null,
//         });
//         break;

//       default:
//         return res.status(400).json({ message: "Invalid booking type" });
//     }

//     // --- PASSENGERS for SINGLE/ROUND trips ---
//     if (bookingRecord?.id && tripType !== "multi") {
//       await Passenger.destroy({ where: { bookingId: bookingRecord.id, type } });
//       if (passengersArray.length > 0) {
//         const passengerData = passengersArray.map((p) => ({
//           bookingId: bookingRecord.id,
//           type,
//           name: p.name,
//           age: p.age,
//           gender: p.gender,
//           honorifics: p.honorifics,
//         }));
//         await Passenger.bulkCreate(passengerData);
//       }
//     }

//     // --- TRIP DETAILS for SINGLE/ROUND trips ---
//     if (tripType !== "multi") {
//       await TripDetails.create({
//         bookingId: bookingRecord.id,
//         bookingType: type,
//         tripType: tripType || "single",
//         tripGroupId: finalTripGroupId,
//         departureDate: booking.departureDateTime || booking.departureDate,
//         returnDate: booking.returnDateTime || booking.returnDate || null,
//         airline: booking.airline || null,
//         flightNumber: booking.flightNumber || null,
//         fromAirport: booking.fromAirport || null,
//         toAirport: booking.toAirport || null,
//         travelClass: booking.travelClass || null,
//         boardingPoint: booking.boardingPoint || null,
//         busType: booking.busType || null,
//         fromStop: booking.fromStop || null,
//         toStop: booking.toStop || null,
//         seatNumber: booking.seatNumber || null,
//         seatType: booking.seatType || null,
//       });
//     }

//     return res.status(201).json({
//       message: `Booking created successfully for ${type}`,
//       booking: tripType === "multi" ? undefined : bookingRecord,
//     });
//   } catch (error) {
//     console.error("Error in createBooking Controller:", error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// exports.updateBooking = async (req, res) => {
//   try {
//     const { type, id } = req.params;
//     const { client, booking, tripType, tripGroupId } = req.body;

//     if (!client || !booking) {
//       return res.status(400).json({ message: "Missing data" });
//     }

//     let BookingModel;
//     if (type === "bus") BookingModel = BookingBus;
//     else if (type === "rail") BookingModel = BookingRail;
//     else if (type === "flight") BookingModel = BookingFlight;
//     else return res.status(400).json({ message: "Invalid booking type" });

//     const bookingRecord = await BookingModel.findByPk(id);
//     if (!bookingRecord) return res.status(404).json({ message: "Booking not found" });

//     await Client.update(
//       { name: client.name, phone: client.phone, email: client.email, address: client.address },
//       { where: { id: bookingRecord.clientId } }
//     );

//     const updatedBooking = await bookingRecord.update({
//       ...booking,
//       clientSnapshotName: client.name,
//       tripType: tripType || bookingRecord.tripType,
//       tripGroupId: tripGroupId || bookingRecord.tripGroupId,
//     });

//     if (booking.passengers?.length > 0) {
//       await Passenger.destroy({ where: { bookingId: id, type } });
//       const passengersFormatted = booking.passengers.map((p) => ({
//         bookingId: id,
//         type,
//         name: p.name,
//         age: p.age,
//         gender: p.gender,
//         honorifics: p.honorifics,
//         seatNumber: p.seatNumber || null,
//       }));
//       await Passenger.bulkCreate(passengersFormatted);
//     }

//     const tripDetail = await TripDetails.findOne({ where: { bookingId: id, bookingType: type } });
//     if (tripDetail) {
//       await tripDetail.update({
//         tripType: tripType || tripDetail.tripType,
//         tripGroupId: tripGroupId || tripDetail.tripGroupId,
//         departureDate: booking.departureDateTime || booking.departureDate || tripDetail.departureDate,
//         returnDate: booking.returnDateTime || booking.returnDate || tripDetail.returnDate,
//         airline: booking.airline || tripDetail.airline,
//         flightNumber: booking.flightNumber || tripDetail.flightNumber,
//         fromAirport: booking.fromAirport || tripDetail.fromAirport,
//         toAirport: booking.toAirport || tripDetail.toAirport,
//         travelClass: booking.travelClass || tripDetail.travelClass,
//         boardingPoint: booking.boardingPoint || tripDetail.boardingPoint,
//         busType: booking.busType || tripDetail.busType,
//         fromStop: booking.fromStop || tripDetail.fromStop,
//         toStop: booking.toStop || tripDetail.toStop,
//         seatNumber: booking.seatNumber || tripDetail.seatNumber,
//         seatType: booking.seatType || tripDetail.seatType,
//       });
//     }

//     if (booking.totalAmount) {
//       await Ledger.update({ amount: booking.totalAmount }, { where: { bookingId: id, bookingType: type } });
//     }

//     return res.status(200).json({ success: true, message: "Booking updated successfully", booking: updatedBooking });
//   } catch (error) {
//     console.error("Error updating booking:", error);
//     return res.status(500).json({ success: false, message: "Server Error", error: error.message });
//   }
// };

// exports.getConfirmedBookings = async (req, res) => {
//   try {
//     const { role, id: userId } = req.user;
//     const isAgent = role?.toLowerCase() === "agent";
//     const bookedByFilter = isAgent ? { bookedBy: userId } : {};

//     const [busBookings, railBookings, flightBookings] = await Promise.all([
//       BookingBus.findAll({
//         where: { [Op.and]: [{ ticketStatus: { [Op.in]: ["Confirmed", "Waiting"] } }, bookedByFilter] },
//         include: [
//           { model: Client, as: "client", attributes: ["id", "name", "phone", "email"] },
//           { model: TripDetails, as: "tripDetails" },
//           { model: Passenger, as: "busPassengers" },
//         ],
//         order: [["updatedAt", "DESC"]],
//       }),
//       BookingRail.findAll({
//         where: { [Op.and]: [{ ticketStatus: { [Op.in]: ["Confirmed", "Waiting"] } }, bookedByFilter] },
//         include: [
//           { model: Client, as: "client", attributes: ["id", "name", "phone", "email"] },
//           { model: TripDetails, as: "tripDetails" },
//           { model: Passenger, as: "railPassengers" },
//         ],
//         order: [["updatedAt", "DESC"]],
//       }),
//       BookingFlight.findAll({
//         where: { [Op.and]: [{ ticketStatus: { [Op.in]: ["Confirmed", "Waiting"] } }, bookedByFilter] },
//         include: [
//           { model: Client, as: "client", attributes: ["id", "name", "phone", "email"] },
//           { model: TripDetails, as: "tripDetails" },
//           { model: Passenger, as: "flightPassengers" },
//         ],
//         order: [["updatedAt", "DESC"]],
//       }),
//     ]);

//     const allBookings = [
//       ...busBookings.map((b) => ({
//         bookingId: b.id,
//         clientName: b.client?.name || "Unknown",
//         type: "Bus",
//         route: b.fromStop && b.toStop ? `${b.fromStop} - ${b.toStop}` : "N/A",
//         journeyDate: b.tripDetails?.departureDate || "N/A",
//         returnDate: b.tripDetails?.returnDate || null,
//         tripType: b.tripType,
//         ticketStatus: b.ticketStatus,
//         amount: b.totalAmount ?? null,
//         bookingDate: b.createdAt,
//         passengers: b.busPassengers ?? [],
//       })),
//       ...railBookings.map((r) => ({
//         bookingId: r.id,
//         clientName: r.client?.name || "Unknown",
//         type: "Rail",
//         route: r.fromStation && r.toStation ? `${r.fromStation} - ${r.toStation}` : "N/A",
//         journeyDate: r.tripDetails?.departureDate || "N/A",
//         returnDate: r.tripDetails?.returnDate || null,
//         tripType: r.tripType,
//         ticketStatus: r.ticketStatus,
//         amount: r.totalAmount ?? null,
//         bookingDate: r.createdAt,
//         passengers: r.railPassengers ?? [],
//       })),
//       ...flightBookings.map((f) => ({
//         bookingId: f.id,
//         clientName: f.client?.name || "Unknown",
//         type: "Flight",
//         route: f.fromAirport && f.toAirport ? `${f.fromAirport} - ${f.toAirport}` : "N/A",
//         journeyDate: f.tripDetails?.departureDate || "N/A",
//         returnDate: f.tripDetails?.returnDate || null,
//         tripType: f.tripType,
//         ticketStatus: f.ticketStatus,
//         amount: f.totalAmount ?? null,
//         bookingDate: f.createdAt,
//         passengers: f.flightPassengers ?? [],
//       })),
//     ];

//     return res.status(200).json({ success: true, count: allBookings.length, bookings: allBookings });
//   } catch (err) {
//     console.error("Error fetching confirmed bookings:", err);
//     return res.status(500).json({ success: false, message: "Server Error", error: err.message });
//   }
// };

// exports.getConfirmedBookingById = async (req, res) => {
//   try {
//     const { type, bookingId } = req.params;

//     let BookingModel;
//     let passengerInclude;
//     switch (type) {
//       case "bus":
//         BookingModel = BookingBus;
//         passengerInclude = "busPassengers";
//         break;
//       case "rail":
//         BookingModel = BookingRail;
//         passengerInclude = "railPassengers";
//         break;
//       case "flight":
//         BookingModel = BookingFlight;
//         passengerInclude = "flightPassengers";
//         break;
//       default:
//         return res.status(400).json({ message: "Invalid booking type" });
//     }

//     const booking = await BookingModel.findOne({
//       where: { id: bookingId, ticketStatus: { [Op.in]: ["Confirmed", "Waiting"] } },
//       include: [
//         { model: Client, as: "client", attributes: ["id", "name", "phone", "email"] },
//         { model: TripDetails, as: "tripDetails" },
//         { model: Passenger, as: passengerInclude },
//       ],
//     });

//     if (!booking) return res.status(404).json({ message: "Confirmed booking not found" });

//     const route =
//       type === "bus"
//         ? booking.fromStop && booking.toStop ? `${booking.fromStop} - ${booking.toStop}` : "N/A"
//         : type === "rail"
//         ? booking.fromStation && booking.toStation ? `${booking.fromStation} - ${booking.toStation}` : "N/A"
//         : type === "flight"
//         ? booking.fromAirport && booking.toAirport ? `${booking.fromAirport} - ${booking.toAirport}` : "N/A"
//         : "N/A";

//     const response = {
//       bookingId: booking.id,
//       type: type.charAt(0).toUpperCase() + type.slice(1),
//       tripType: booking.tripType,
//       ticketStatus: booking.ticketStatus,
//       amount: booking.totalAmount ?? null,
//       totalAmount: booking.totalAmount ?? null,
//       bookingDate: booking.createdAt,
//       route,
//       returnDate: booking.tripDetails?.returnDate || null,
//       client: booking.client,
//       passengers: booking[passengerInclude] ?? [],
//       tripDetails: booking.tripDetails ?? null,
//       companyId: booking.companyId ?? null,
//     };

//     return res.status(200).json({ success: true, booking: response });
//   } catch (err) {
//     console.error("Error fetching confirmed booking by ID:", err);
//     return res.status(500).json({ success: false, message: "Server Error", error: err.message });
//   }
// };
