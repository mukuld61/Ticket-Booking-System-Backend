

// const BookingFlight = require("../models/bookingFlightModel");
// const BookingRailway = require("../models/bookingRailModel");
// const BookingBus = require("../models/bookingBusModel");
// const CancelledBooking = require("../models/cancelledBookingModel");
// const Ledger = require("../models/ledgerModel");
// const Client = require("../models/clientModel");
// const BookingUpdate = require("../models/bookingUpdateModel");
// const sequelize = require("../config/db");
// const generateBillNo = require("../utils/billNoGenerator");
// const Invoice = require("../models/invoicesModel");


// exports.cancelBooking = async (req, res) => {
//   const t = await sequelize.transaction();

//   try {
//     const { type, bookingId } = req.params;

//     let bookingModel;

//     if (type === "bus") bookingModel = BookingBus;
//     else if (type === "rail") bookingModel = BookingRailway;
//     else if (type === "flight") bookingModel = BookingFlight;
//     else {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid booking type",
//       });
//     }

//     const booking = await bookingModel.findByPk(bookingId);
//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found",
//       });
//     }

//     if (booking.ticketStatus === "Cancelled") {
//       return res.status(400).json({
//         success: false,
//         message: "Booking already cancelled",
//       });
//     }

//     const {
//       totalAmount,
//       cancellationCharge,
//       serviceChargeCancellation,
//       paidAmount,
//       remainingAmount,
//       cancellationDate,
//       remarks,
//     } = req.body;

//     // calculated so response does not break
//     const refundAmount = Number(remainingAmount) > 0 ? Number(remainingAmount) : 0;

//     const billNo = await generateBillNo();

//     // Create cancellation record
//     const cancelRecord = await CancelledBooking.create(
//       {
//         bookingId,
//         bookingType: type,
//         clientId: booking.clientId,
//         companyId: booking.companyId,

//         billNo,

//         totalAmount,
//         cancellationCharge,
//         serviceChargeCancellation,

//         paidAmount,
//         remainingAmount,

//         cancellationDate,
//         remarks,

//         cancelledBy: req.user.id,
//       },
//       { transaction: t }
//     );

//     // Invoice entry
//     await Invoice.create(
//       {
//         billNo,
//         bookingId,
//         bookingType: type,

//         clientId: booking.clientId,
//         companyId: booking.companyId,
//         agentId: req.user.id,

//         reference: `Cancellation for ${type.toUpperCase()} booking #${bookingId}`,
//         type: "cancellation",

//         totalAmount,
//         cancellationCharge,
//         serviceCharge: serviceChargeCancellation,
//         paidAmount,
//         remainingAmount,

//         createdBy: req.user.id,
//       },
//       { transaction: t }
//     );

//     // Update booking status
//     await booking.update(
//       { ticketStatus: "Cancelled" },
//       { transaction: t }
//     );

//     // Refund to wallet (credit)
//     if (remainingAmount > 0) {
//       await Ledger.create(
//         {
//           clientId: booking.clientId,
//           agentId: booking.agentId,
//           bookingId,
//           bookingType: type,
//           entryType: "credit",
//           amount: remainingAmount,
//           description: `Refund issued for cancelled ${type.toUpperCase()} booking (#${bookingId})`,
//           paymentMode: "Refund to wallet",
//           billNo,
//           createdBy: req.user.id,
//         },
//         { transaction: t }
//       );
//     }

//     // Pending cancellation charges (debit)
//     if (remainingAmount > 0) {
//       await Ledger.create(
//         {
//           clientId: booking.clientId,
//           agentId: booking.agentId,
//           bookingId,
//           bookingType: type,
//           entryType: "debit",
//           amount: remainingAmount,
//           description: `Pending cancellation charges for ${type.toUpperCase()} booking (#${bookingId})`,
//           paymentMode: "Outstanding Payment",
//           billNo,
//           createdBy: req.user.id,
//         },
//         { transaction: t }
//       );
//     }

//     // ---- FINAL COMMIT ----
//     await t.commit();

//     return res.status(201).json({
//       success: true,
//       message: "Booking cancelled successfully",
//       billNo,
//       cancelRecord,
//       refundAmount,
//       remainingAmount,
//     });

//   } catch (err) {
//     console.error("Error in cancel booking:", err);

//     if (!t.finished) {
//       await t.rollback();
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Error cancelling booking",
//       error: err.message,
//     });
//   }
// };

// exports.getCancelledBookings = async (req, res) => {
//   try {
//     const results = await Promise.all([
//       BookingBus.findAll({
//         where: { ticketStatus: "Cancelled" },
//         include: [{ model: Client, as: "client", attributes: ["name"] }],
//       }),
//       BookingRailway.findAll({
//         where: { ticketStatus: "Cancelled" },
//         include: [{ model: Client, as: "client", attributes: ["name"] }],
//       }),
//       BookingFlight.findAll({
//         where: { ticketStatus: "Cancelled" },
//         include: [{ model: Client, as: "client", attributes: ["name"] }],
//       }),
//     ]);

//     const [busBookings, railBookings, flightBookings] = results;

//     const allCancelled = [
//       ...busBookings.map((b) => ({
//         bookingId: b.id,
//         clientName: b.client?.name || "Unknown",
//         type: "Bus",
//         route: `${b.fromStop} - ${b.toStop}`,
//         ticketStatus: b.ticketStatus,
//         totalAmount: b.fare,
//         cancellationDate: b.updatedAt,
//       })),
//       ...railBookings.map((r) => ({
//         bookingId: r.id,
//         clientName: r.client?.name || "Unknown",
//         type: "Rail",
//         route: `${r.fromStation} - ${r.toStation}`,
//         ticketStatus: r.ticketStatus,
//         totalAmount: r.fare,
//         cancellationDate: r.updatedAt,
//       })),
//       ...flightBookings.map((f) => ({
//         bookingId: f.id,
//         clientName: f.client?.name || "Unknown",
//         type: "Flight",
//         route: `${f.fromAirport} - ${f.toAirport}`,
//         ticketStatus: f.ticketStatus,
//         totalAmount: f.fare,
//         cancellationDate: f.updatedAt,
//       })),
//     ];

//     res.status(200).json({
//       success: true,
//       count: allCancelled.length,
//       cancelledBookings: allCancelled,
//     });
//   } catch (error) {
//     console.error("Error fetching cancelled bookings:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };


const BookingFlight = require("../models/bookingFlightModel");
const BookingRailway = require("../models/bookingRailModel");
const BookingBus = require("../models/bookingBusModel");
const CancelledBooking = require("../models/cancelledBookingModel");
const Ledger = require("../models/ledgerModel");
const Client = require("../models/clientModel");
const BookingUpdate = require("../models/bookingUpdateModel");
const sequelize = require("../config/db");
const generateBillNo = require("../utils/billNoGenerator");
const Invoice = require("../models/invoicesModel");
const { Op } = require("sequelize");

// exports.cancelBooking = async (req, res) => {
//   const t = await sequelize.transaction();

//   try {
//     const { type, bookingId } = req.params;
//     let bookingModel;

//     if (type === "bus") bookingModel = BookingBus;
//     else if (type === "rail") bookingModel = BookingRailway;
//     else if (type === "flight") bookingModel = BookingFlight;
//     else
//       return res.status(400).json({
//         success: false,
//         message: "Invalid booking type",
//       });

//     const booking = await bookingModel.findByPk(bookingId);
//     if (!booking)
//       return res.status(404).json({ success: false, message: "Booking not found" });

//     if (booking.ticketStatus === "Cancelled")
//       return res.status(400).json({ success: false, message: "Booking already cancelled" });

//     const {
//       totalAmount,
//       cancellationCharge,
//       serviceChargeCancellation,
//       paidAmount,
//       remainingAmount,
//       cancellationDate,
//       remarks,
//     } = req.body;

//     const refundAmount = Number(remainingAmount) > 0 ? Number(remainingAmount) : 0;
//     const billNo = await generateBillNo();

//     // ------------------ CANCELLED BOOKING ------------------
//     const cancelRecord = await CancelledBooking.create(
//       {
//         bookingId,
//         bookingType: type,
//         clientId: booking.clientId,
//         companyId: booking.companyId,
//         billNo,
//         totalAmount,
//         cancellationCharge,
//         serviceChargeCancellation,
//         paidAmount,
//         remainingAmount,
//         cancellationDate,
//         remarks,
//         cancelledBy: req.user.id,
//       },
//       { transaction: t }
//     );

//     // ------------------ INVOICE ENTRY ------------------
//     await Invoice.create(
//       {
//         billNo,
//         bookingId,
//         bookingType: type,
//         clientId: booking.clientId,
//         companyId: booking.companyId,
//         agentId: req.user.id,
//         reference: `Cancellation for ${type.toUpperCase()} booking #${bookingId}`,
//         type: "cancellation",
//         totalAmount,
//         cancellationCharge,
//         serviceCharge: serviceChargeCancellation,
//         paidAmount,
//         remainingAmount,
//         createdBy: req.user.id,
//       },
//       { transaction: t }
//     );

//     // ------------------ UPDATE BOOKING STATUS ------------------
//     await booking.update({ ticketStatus: "Cancelled" }, { transaction: t });

//     // ------------------ LEDGER ENTRIES ------------------
//     if (remainingAmount > 0) {
//       // Credit (Refund)
//       await Ledger.create(
//         {
//           clientId: booking.clientId,
//           agentId: booking.agentId,
//           bookingId,
//           bookingType: type,
//           entryType: "credit",
//           amount: remainingAmount,
//           description: `Refund issued for cancelled ${type.toUpperCase()} booking (#${bookingId})`,
//           paymentMode: "Refund to wallet",
//           billNo,
//           createdBy: req.user.id,
//         },
//         { transaction: t }
//       );

//       // Debit (Pending cancellation)
//       await Ledger.create(
//         {
//           clientId: booking.clientId,
//           agentId: booking.agentId,
//           bookingId,
//           bookingType: type,
//           entryType: "debit",
//           amount: remainingAmount,
//           description: `Pending cancellation charges for ${type.toUpperCase()} booking (#${bookingId})`,
//           paymentMode: "Outstanding Payment",
//           billNo,
//           createdBy: req.user.id,
//         },
//         { transaction: t }
//       );
//     }

//     await t.commit();

//     return res.status(201).json({
//       success: true,
//       message: "Booking cancelled successfully",
//       billNo,
//       cancelRecord,
//       refundAmount,
//       remainingAmount,
//     });
//   } catch (err) {
//     console.error("Error in cancel booking:", err);
//     if (!t.finished) await t.rollback();
//     return res.status(500).json({
//       success: false,
//       message: "Error cancelling booking",
//       error: err.message,
//     });
//   }
// };

exports.cancelBooking = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { type, bookingId } = req.params;

    let bookingModel;
    if (type === "bus") bookingModel = BookingBus;
    else if (type === "rail") bookingModel = BookingRailway;
    else if (type === "flight") bookingModel = BookingFlight;
    else {
      return res.status(400).json({ success: false, message: "Invalid booking type" });
    }

    const booking = await bookingModel.findByPk(bookingId, { transaction: t });
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.ticketStatus === "Cancelled")
      return res.status(400).json({ success: false, message: "Booking already cancelled" });

    const {
      totalAmount,
      cancellationCharge,
      serviceChargeCancellation,
      paidAmount,
      remainingAmount,        
      cancellationDate,
      remarks,
    } = req.body;

    const billNo = await generateBillNo();

  

    const cancelRecord = await CancelledBooking.create(
      {
        bookingId,
        bookingType: type,
        clientId: booking.clientId,
        companyId: booking.companyId,
        billNo,
        totalAmount,
        cancellationCharge,
        serviceChargeCancellation,
        paidAmount,
        remainingAmount,
        cancellationDate,
        remarks,
        cancelledBy: req.user.id,
      },
      { transaction: t }
    );

   

    await Invoice.create(
      {
        billNo,
        bookingId,
        bookingType: type,
        clientId: booking.clientId,
        companyId: booking.companyId,
        agentId: req.user.id,
        type: "cancellation",
        reference: `Cancellation for ${type.toUpperCase()} booking #${bookingId}`,
        totalAmount: Math.abs(Number(remainingAmount)),
        paidAmount,
        remainingAmount,
        createdBy: req.user.id,
      },
      { transaction: t }
    );



    await booking.update(
      { ticketStatus: "Cancelled" },
      { transaction: t }
    );

 

    // if (Number(remainingAmount) > 0) {

    //   await Ledger.create(
    //     {
    //       clientId: booking.clientId,
    //       bookingId,
    //       bookingType: type,
    //       entryType: "credit",
    //       amount: remainingAmount,
    //       description: `Refund for cancelled ${type.toUpperCase()} booking (#${bookingId})`,
    //       paymentMode: "Refund",
    //       billNo,
    //       createdBy: req.user.id,
    //     },
    //     { transaction: t }
    //   );
    // }

    // if (Number(remainingAmount) < 0) {
    //   // Client has to pay more
    //   await Ledger.create(
    //     {
    //       clientId: booking.clientId,
    //       bookingId,
    //       bookingType: type,
    //       entryType: "credit",
    //       amount: Math.abs(remainingAmount),
    //       description: `Pending cancellation charges for ${type.toUpperCase()} booking (#${bookingId})`,
    //       paymentMode: "Outstanding",
    //       billNo,
    //       createdBy: req.user.id,
    //     },
    //     { transaction: t }
    //   );
    // }


if (Number(remainingAmount) > 0) {

  await Ledger.create(
    {
      clientId: booking.clientId,
      agentId: booking.agentId,
      bookingId,
      bookingType: type,
      entryType: "debit",
      amount: Number(remainingAmount),
      description: `Cancellation amount due for ${type.toUpperCase()} booking (#${bookingId})`,
      paymentMode: "Due",
      billNo,
      createdBy: req.user.id,
    },
    { transaction: t }
  );
}

if (Number(remainingAmount) < 0) {

  await Ledger.create(
    {
      clientId: booking.clientId,
      agentId: booking.agentId,
      bookingId,
      bookingType: type,
      entryType: "credit",
      amount: Math.abs(Number(remainingAmount)),
      description: `Refund for cancelled ${type.toUpperCase()} booking (#${bookingId})`,
      paymentMode: "Refund",
      billNo,
      createdBy: req.user.id,
    },
    { transaction: t }
  );
}


    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Booking cancelled successfully",
      billNo,
      cancelRecord,
    });

  } catch (err) {
    console.error("Cancel Booking Error:", err);
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: err.message,
    });
  }
};


// exports.getCancelledBookings = async (req, res) => {

//   try {
//     const { role, id: userId } = req.user;


//     const cancelledBookings = await CancelledBooking.findAll({
//       order: [["cancellationDate", "DESC"]],
//     });

//     const clientIds = cancelledBookings.map(c => c.clientId);
//     const clients = await Client.findAll({
//       where: { id: clientIds },
//     });
//     const clientMap = {};
//     clients.forEach(c => (clientMap[c.id] = c));

//     let allCancelled = cancelledBookings.map((c) => ({
//       bookingId: c.bookingId,
//       clientName: clientMap[c.clientId]?.name || "Unknown",
//       type: c.bookingType.charAt(0).toUpperCase() + c.bookingType.slice(1),
//       ticketStatus: "Cancelled",
//       totalAmount: c.totalAmount,
//       cancellationDate: c.cancellationDate,
//       cancelledBy: c.cancelledBy,
//       billNo: c.billNo,
//     }));

//     // Role-based filter
//     if (role?.toLowerCase() === "agent") {
//       allCancelled = allCancelled.filter((b) => b.cancelledBy === userId);
//     }

//     return res.status(200).json({
//       success: true,
//       count: allCancelled.length,
//       cancelledBookings: allCancelled,
//     });

//   } catch (error) {
//     console.error("Error fetching cancelled bookings:", error);
//     return res.status(500).json({ success: false, message: "Server Error" });
//   }
// };


exports.getCancelledBookings = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    const cancelledBookings = await CancelledBooking.findAll({
      order: [["cancellationDate", "DESC"]],
    });

    const clientIds = cancelledBookings.map(c => c.clientId);
    const clients = await Client.findAll({
      where: { id: clientIds },
    });

    const clientMap = {};
    clients.forEach(c => (clientMap[c.id] = c));

    let allCancelled = cancelledBookings.map((c) => ({
      bookingId: c.bookingId,
      clientName: clientMap[c.clientId]?.name || "Unknown",
      type: c.bookingType.charAt(0).toUpperCase() + c.bookingType.slice(1),
      ticketStatus: "Cancelled",
      totalAmount: c.totalAmount,
      cancellationDate: c.cancellationDate,
      cancelledBy: c.cancelledBy,
      billNo: c.billNo,
    }));

    
    if (role?.toLowerCase() === "agent") {
      allCancelled = allCancelled.filter(
        (b) => Number(b.cancelledBy) === Number(userId)
      );
    }

    allCancelled.sort(
      (a, b) =>
        new Date(b.cancellationDate) - new Date(a.cancellationDate)
    );

    return res.status(200).json({
      success: true,
      count: allCancelled.length,
      cancelledBookings: allCancelled,
    });

  } catch (error) {
    console.error("Error fetching cancelled bookings:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
