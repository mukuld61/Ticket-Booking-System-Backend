const BookingUpdate = require("../models/bookingUpdateModel");
const BookingFlight = require("../models/bookingFlightModel");
const BookingBus = require("../models/bookingBusModel");
const BookingRail = require("../models/bookingRailModel");
const Client = require("../models/clientModel");
const Passenger = require("../models/passengerModel");
const Ledger = require("../models/ledgerModel");
const generateBillNo = require("../utils/billNoGenerator");
const sequelize = require("../config/db");
const Invoice = require("../models/invoicesModel");
const BookingTrip = require("../models/bookingTrip");

// exports.createBookingUpdate = async (req, res) => {
//   const t = await sequelize.transaction(); // Start transaction
//   try {
//     const { type, bookingId } = req.params;
//     const {
//       pnrNumber,
//       ticketNumber,
//       ticketType,
//       ticketAmount,
//       bookingCharge,
//       typeServiceCharge,
//       otherCharge,
//       totalAmount,
//       journeyDate,
//       remarks,
//       ticketStatus,
//       paymentMode,
//     } = req.body;

//     const uploadTicket = req.file ? req.file.path : null;
//     const billNo = await generateBillNo();

//     const bookingModel =
//       type === "flight"
//         ? BookingFlight
//         : type === "bus"
//         ? BookingBus
//         : type === "rail"
//         ? BookingRail
//         : null;

//     if (!bookingModel) {
//       await t.rollback();
//       return res.status(400).json({ message: "Invalid booking type" });
//     }

//     const booking = await bookingModel.findByPk(bookingId, { transaction: t });
//     if (!booking) {
//       await t.rollback();
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     const client = await Client.findByPk(booking.clientId, { transaction: t });
//     if (!client) {
//       await t.rollback();
//       return res.status(404).json({ message: "Client not found" });
//     }

//     const finalStatus = ticketStatus || "Pending";

//     await Invoice.create(
//       {
//         billNo,
//         type: "booking-update",
//         totalAmount: totalAmount || 0,
//         clientId: booking.clientId,
//         bookingId: booking.id,
//         agentId: booking.agentId,
//         companyId: booking.companyId || null,
//         bookingUpdateId: booking.id,

//         createdBy: req.user.id,
//         reference: `Booking Update #${bookingId}`,
//       },
//       { transaction: t }
//     );

//     const existingUpdate = await BookingUpdate.findOne({
//       where: { bookingId, bookingType: type },
//       transaction: t,
//     });

//     const updateData = {
//       bookingId,
//       bookingType: type,
//       pnrNumber,
//       journeyDate,
//       ticketNumber,
//       ticketType,
//       ticketAmount,
//       bookingCharge,
//       typeServiceCharge,
//       otherCharge,
//       totalAmount,
//       billNo,
//       uploadTicket,
//       remarks,
//       ticketStatus: finalStatus,
//       updatedBy: req.user.id,
//       clientId: booking.clientId,
//     };

//     if (existingUpdate) {
//       await BookingUpdate.update(updateData, {
//         where: { id: existingUpdate.id },
//         transaction: t,
//       });
//     } else {
//       await BookingUpdate.create(updateData, { transaction: t });
//     }

//     await bookingModel.update(
//       { ticketStatus: finalStatus, totalAmount, pnrNumber, billNo },
//       { where: { id: bookingId }, transaction: t }
//     );

//     client.remainingBalance =
//       (Number(client.remainingBalance) || 0) + Number(totalAmount || 0);
//     await client.save({ transaction: t });

//     await Ledger.create(
//       {
//         clientId: client.id,
//         companyId: booking.companyId || null,
//         agentId: req.user.id,
//         bookingId: booking.id,
//         bookingType: type,
//         entryType: "debit",
//         description: `Booking Update - ${type.toUpperCase()} (${client.name})`,
//         amount: totalAmount || 0,
//         billNo,
//         paymentMode: paymentMode || "Cash",
//         createdBy: req.user.id,
//       },
//       { transaction: t }
//     );

//     await t.commit();

//     return res.status(200).json({
//       success: true,
//       message: "Booking updated & Ledger + Invoice added successfully",
//       billNo,
//     });
//   } catch (err) {
//     await t.rollback();
//     console.error("Error in booking update:", err);
//     return res.status(500).json({
//       message: "Error updating booking",
//       error: err.message,
//     });
//   }
// };

exports.createBookingUpdate = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { type, bookingId } = req.params;
    const {
      pnrNumber,
      ticketNumber,
      ticketType,
      ticketAmount,
      bookingCharge,
      typeServiceCharge,
      otherCharge,
      totalAmount,
      journeyDate,
      remarks,
      ticketStatus,
      paymentMode,
    } = req.body;
    console.log("hello ", req.body);
    const uploadTicket = req.file ? req.file.path : null;
    const billNo = await generateBillNo();

    const bookingModel =
      type === "flight"
        ? BookingFlight
        : type === "bus"
        ? BookingBus
        : type === "rail"
        ? BookingRail
        : null;

    if (!bookingModel) {
      await t.rollback();
      return res.status(400).json({ message: "Invalid booking type" });
    }

    const booking = await bookingModel.findByPk(bookingId, { transaction: t });
    if (!booking) {
      await t.rollback();
      return res.status(404).json({ message: "Booking not found" });
    }

    const client = await Client.findByPk(booking.clientId, { transaction: t });
    if (!client) {
      await t.rollback();
      return res.status(404).json({ message: "Client not found" });
    }

    const finalStatus = ticketStatus || "Pending";

    let existingUpdate = await BookingUpdate.findOne({
      where: { bookingId, bookingType: type },
      transaction: t,
    });

    const updateData = {
      bookingId,
      bookingType: type,
      pnrNumber,
      journeyDate,
      ticketNumber,
      ticketType,
      ticketAmount,
      bookingCharge,
      typeServiceCharge,
      otherCharge,
      totalAmount,
      billNo,
      uploadTicket,
      remarks,
      ticketStatus: finalStatus,
      updatedBy: req.user.id,
      clientId: booking.clientId,
    };

    let bookingUpdateRecord;

    if (existingUpdate) {
      await existingUpdate.update(updateData, { transaction: t });
      bookingUpdateRecord = existingUpdate;
    } else {
      bookingUpdateRecord = await BookingUpdate.create(updateData, {
        transaction: t,
      });
    }

    const realBookingUpdateId = bookingUpdateRecord.id;

    await Invoice.create(
      {
        billNo,
        type: "booking-update",
        totalAmount: totalAmount || 0,
        clientId: booking.clientId,
        bookingId: booking.id,
        agentId: booking.agentId,
        companyId: booking.companyId || null,
        bookingUpdateId: booking.id,
        bookingType: type,
        createdBy: req.user.id,
        reference: `Booking Update #${bookingId}`,
      },
      { transaction: t }
    );

    await bookingModel.update(
      { ticketStatus: finalStatus, totalAmount, pnrNumber, billNo },
      { where: { id: bookingId }, transaction: t }
    );

    client.remainingBalance =
      (Number(client.remainingBalance) || 0) + Number(totalAmount || 0);
    await client.save({ transaction: t });

    await Ledger.create(
      {
        clientId: client.id,
        companyId: booking.companyId || null,
        agentId: req.user.id,
        bookingId: booking.id,
        bookingType: type,
        entryType: "debit",
        description: `Booking Update - ${type.toUpperCase()} (${client.name})`,
        amount: totalAmount || 0,
        billNo,
        paymentMode: paymentMode || "Cash",
        createdBy: req.user.id,
      },
      { transaction: t }
    );

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Booking updated & Ledger + Invoice added successfully",
      billNo,
    });
  } catch (err) {
    await t.rollback();
    console.error("Error in booking update:", err);
    return res.status(500).json({
      message: "Error updating booking",
      error: err.message,
    });
  }
};

// exports.getBookingDetails = async (req, res) => {
//   try {
//     const { type, bookingId } = req.params;

//     let bookingModel;
//     if (type === "flight") bookingModel = BookingFlight;
//     else if (type === "bus") bookingModel = BookingBus;
//     else if (type === "rail") bookingModel = BookingRail;
//     else return res.status(400).json({ message: "Invalid booking type" });

//     const booking = await bookingModel.findByPk(bookingId, {
//       include: [
//         { model: Client, as: "client" },
//         {
//           model: Passenger,
//           as: `${type}Passengers`,
//           where: { type: type },
//           required: false,
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     res.status(200).json({ success: true, booking });
//   } catch (err) {
//     console.error("Error fetching booking details:", err);
//     res
//       .status(500)
//       .json({ message: "Error fetching booking details", error: err.message });
//   }
// };

exports.getBookingDetails = async (req, res) => {
  try {
    const { type, bookingId } = req.params;

    let bookingModel;
    let passengerAlias;

    if (type === "flight") {
      bookingModel = BookingFlight;
      passengerAlias = "flightPassengers";
    } else if (type === "bus") {
      bookingModel = BookingBus;
      passengerAlias = "busPassengers";
    } else if (type === "rail") {
      bookingModel = BookingRail;
      passengerAlias = "railPassengers";
    } else {
      return res.status(400).json({ message: "Invalid booking type" });
    }

    const tripeDetails = await BookingTrip.findAll({
      where: [{ bookingId: bookingId }, { bookingType: type }],
    });

    const booking = await bookingModel.findByPk(bookingId, {
      include: [
        { model: Client, as: "client" },
        {
          model: Passenger,
          as: passengerAlias,
          required: false,
          where: {
            type: type, 
          },
        },
      ],
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res
      .status(200)
      .json({ success: true, booking, bookingTripDetails: tripeDetails });
  } catch (err) {
    console.error("Error fetching booking details:", err);
    res.status(500).json({
      message: "Error fetching booking details",
      error: err.message,
    });
  }
};
