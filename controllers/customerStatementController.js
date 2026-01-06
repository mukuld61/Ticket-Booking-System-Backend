
const Ledger = require("../models/ledgerModel");
const Company = require("../models/companyModel");
const Client = require("../models/clientModel");
const FlightBooking = require("../models/bookingFlightModel");
const BusBooking = require("../models/bookingBusModel");
const RailBooking = require("../models/bookingRailModel");
const Invoice = require("../models/invoicesModel");
const BookingUpdate = require("../models/bookingUpdateModel");

// exports.getCustomerStatement = async (req, res) => {
//   try {
//     const { clientId } = req.params;
//     if (!clientId) return res.status(400).json({ success: false, message: "clientId required" });

//     const entries = await Ledger.findAll({
//       where: { clientId },
//       order: [["transactionDate", "ASC"], ["createdAt", "ASC"]],
//     });

    
//     let running = 0;
//     const formatted = entries.map(e => {
//       if (e.entryType === "debit") running = parseFloat((running + Number(e.amount)).toFixed(2));
//       else running = parseFloat((running - Number(e.amount)).toFixed(2));

//       return {
//         id: e.id,
//         date: e.transactionDate,
//         description: e.description,
//         debit: e.entryType === "debit" ? Number(e.amount) : null,
//         credit: e.entryType === "credit" ? Number(e.amount) : null,
//         balanceAfter: e.balanceAfter !== undefined && e.balanceAfter !== null ? Number(e.balanceAfter) : running
//         // balanceAfter: parseFloat(running.toFixed(2))
//       };
//     });

//     return res.status(200).json({ success: true, statement: formatted });
//   } catch (err) {
//     console.error("getCustomerStatement error:", err);
//     return res.status(500).json({ success: false, message: "Server Error", error: err.message });
//   }
// };


// exports.getCustomerStatement = async (req, res) => {
//   try {
//     const { clientId } = req.params;
//     if (!clientId) {
//       return res.status(400).json({ success: false, message: "clientId required" });
//     }

//     const entries = await Ledger.findAll({
//       where: { clientId },
//       include: [
//         {
//           model: Client,
//           as: "client",
//           attributes: ["id", "name", "email", "phone"]
//         },
//         {
//           model: FlightBooking,
//           as: "flightBooking",
//           required: false
//         },
//         {
//           model: BusBooking,
//           as: "busBooking",
//           required: false
//         },
//         {
//           model: RailBooking,
//           as: "railBooking",
//           required: false
//         },
//         {
//           model: Invoice,
//           as: "invoice",
//           required: false
//         }
//       ],
//       order: [
//         ["transactionDate", "ASC"],
//         ["createdAt", "ASC"]
//       ]
//     });

//     let running = 0;

//     const statement = entries.map(e => {
//       if (e.entryType === "debit") {
//         running = parseFloat((running + Number(e.amount)).toFixed(2));
//       } else {
//         running = parseFloat((running - Number(e.amount)).toFixed(2));
//       }

//       // booking resolved via bookingId + bookingType
//       let booking = null;
//       if (e.bookingType === "flight") booking = e.flightBooking;
//       if (e.bookingType === "bus") booking = e.busBooking;
//       if (e.bookingType === "rail") booking = e.railBooking;

//       return {
//         id: e.id,
//         transactionDate: e.transactionDate,
//         description: e.description,

//         client: e.client,

//         bookingId: e.bookingId,
//         bookingType: e.bookingType,
//         bookingDetails: booking,

//         invoice: e.invoice,

//         debit: e.entryType === "debit" ? Number(e.amount) : null,
//         credit: e.entryType === "credit" ? Number(e.amount) : null,

//         balanceAfter:
//           e.balanceAfter !== null && e.balanceAfter !== undefined
//             ? Number(e.balanceAfter)
//             : running
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       clientId,
//       statement
//     });

//   } catch (err) {
//     console.error("getCustomerStatement error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: err.message
//     });
//   }
// };


exports.getCustomerStatement = async (req, res) => {
  try {
    const { clientId } = req.params;
    if (!clientId) {
      return res.status(400).json({ success: false, message: "clientId required" });
    }

    const entries = await Ledger.findAll({
      where: { clientId },
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["id", "name", "email", "phone"]
        },
        {
          model: FlightBooking,
          as: "flightBooking",
          required: false
        },
        {
          model: BusBooking,
          as: "busBooking",
          required: false
        },
        {
          model: RailBooking,
          as: "railBooking",
          required: false
        },
       {
  model: BookingUpdate,
  as: "bookingUpdate",
  required: false,
  attributes: [
    "id",
    "bookingId",
    "bookingType",
    "pnrNumber",
    "ticketNumber",
    "ticketType",
    "ticketAmount",
    "bookingCharge",
    "typeServiceCharge",
    "otherCharge",
    "totalAmount",
    "journeyDate",
    "remarks",
    "ticketStatus",
    "uploadTicket",
    "billNo",
    "clientId"
  ]
}
,
        {
          model: Invoice,
          as: "invoice",
          required: false
        }
      ],
      order: [
        ["transactionDate", "ASC"],
        ["createdAt", "ASC"]
      ]
    });

    let running = 0;

    const statement = entries.map(e => {
      if (e.entryType === "debit") {
        running = parseFloat((running + Number(e.amount)).toFixed(2));
      } else {
        running = parseFloat((running - Number(e.amount)).toFixed(2));
      }

      // resolve booking (latest state)
      let booking = null;
      if (e.bookingType === "flight") booking = e.flightBooking;
      if (e.bookingType === "bus") booking = e.busBooking;
      if (e.bookingType === "rail") booking = e.railBooking;

      return {
        id: e.id,
        transactionDate: e.transactionDate,
        description: e.description,

        client: e.client,

        bookingId: e.bookingId,
        bookingType: e.bookingType,

        // 🔥 LATEST BOOKING
        bookingDetails: booking,

        // 🔥 BOOKING UPDATE DETAILS (THIS WAS MISSING)
        bookingUpdateDetails: e.bookingUpdate ? {
          pnrNumber: e.bookingUpdate.pnrNumber,
          ticketNumber: e.bookingUpdate.ticketNumber,
          ticketType: e.bookingUpdate.ticketType,
          ticketAmount: e.bookingUpdate.ticketAmount,
          bookingCharge: e.bookingUpdate.bookingCharge,
          typeServiceCharge: e.bookingUpdate.typeServiceCharge,
          otherCharge: e.bookingUpdate.otherCharge,
          totalAmount: e.bookingUpdate.totalAmount,
          journeyDate: e.bookingUpdate.journeyDate,
          remarks: e.bookingUpdate.remarks,
          ticketStatus: e.bookingUpdate.ticketStatus,
          uploadTicket: e.bookingUpdate.uploadTicket,
          billNo: e.bookingUpdate.billNo
        } : null,

        invoice: e.invoice,

        debit: e.entryType === "debit" ? Number(e.amount) : null,
        credit: e.entryType === "credit" ? Number(e.amount) : null,

        balanceAfter:
          e.balanceAfter !== null && e.balanceAfter !== undefined
            ? Number(e.balanceAfter)
            : running
      };
    });

    return res.status(200).json({
      success: true,
      clientId,
      statement
    });

  } catch (err) {
    console.error("getCustomerStatement error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message
    });
  }
};
