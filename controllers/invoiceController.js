
// const Invoice = require("../models/invoicesModel");
// const Payment = require("../models/paymentModel");
// const Ledger = require("../models/ledgerModel");
// const BookingUpdate = require("../models/bookingUpdateModel");

// const User = require("../models/userModel");
// const Company = require("../models/companyModel");
// const CancelledBooking = require("../models/cancelledBookingModel");
// const Passenger = require("../models/passengerModel");
// const generateBillNo = require("../utils/billNoGenerator");
// const sequelize = require("../config/db");
// const { Op } = require("sequelize");
// const {
//   Client,
//   FlightBooking,
//   BusBooking,
//   RailwayBooking,
// } = require("../models/associations");

// exports.createInvoice = async (req, res) => {
//   try {
//     const { totalAmount, type, reference, companyId, clientId } = req.body;

//     if (!totalAmount || !type) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Missing required fields" });
//     }

//     const billNo = await generateBillNo();

//     const invoice = await Invoice.create({
//       billNo: generateBillNo(),
//       type: "booking-update",
//       totalAmount,
//       clientId: booking.clientId,
//       agentId: booking.agentId,
//       bookingUpdateId: booking.id,
//       createdBy: currentUserId,
//       reference: `Booking Update #${booking.id}`,
//     });
//     return res.status(201).json({
//       success: true,
//       message: "Invoice created successfully",
//       invoice,
//     });
//   } catch (err) {
//     console.error("Create Invoice Error:", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };





// exports.getInvoiceByBillNo = async (req, res) => {
//   try {
//     const { billNo } = req.params;

//     if (!billNo) {
//       return res.status(400).json({
//         success: false,
//         message: "billNo is required",
//       });
//     }

//     const invoice = await Invoice.findOne({
//       where: { billNo },
//       include: [
//         { model: Client, as: "client" },
//         { model: User, as: "agent" },
//         { model: Company, as: "company" },
//         { model: BookingUpdate, as: "bookingUpdate" },
//       ],
//     });

//     if (!invoice) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice not found",
//       });
//     }

//     let booking = null;
//     let passengers = [];

//     if (invoice.bookingType === "flight") {
//       booking = await FlightBooking.findByPk(invoice.bookingId, {
//         include: [{ model: Passenger, as: "flightPassengers" }],
//       });

//       passengers = booking?.flightPassengers || [];
//     }

//     if (invoice.bookingType === "bus") {
//       booking = await BusBooking.findByPk(invoice.bookingId, {
//         include: [{ model: Passenger, as: "busPassengers" }],
//       });

//       passengers = booking?.busPassengers || [];
//     }

//     if (invoice.bookingType === "rail") {
//       booking = await RailwayBooking.findByPk(invoice.bookingId, {
//         include: [{ model: Passenger, as: "railPassengers" }],
//       });

//       passengers = booking?.railPassengers || [];
//     }

//     // CANCELLED BOOKING
//     const cancelledBooking = await CancelledBooking.findOne({
//       where: { billNo },
//     });

//     // PAYMENTS
//     const payments = await Payment.findAll({
//       where: { billNo },
//       order: [["createdAt", "ASC"]],
//     });

//     // LEDGERS
//     const ledgers = await Ledger.findAll({
//       where: { billNo },
//       order: [["createdAt", "ASC"]],
//     });

//     const response = {
//       success: true,
//       invoice: {
//         billNo: invoice.billNo,
//         createdAt: invoice.createdAt,
//         updatedAt: invoice.updatedAt,

//         company: invoice.company,
//         agent: invoice.agent,
//         client: invoice.client,

//         booking: booking || null,
//         passengers: passengers || [],

//         bookingUpdate: invoice.bookingUpdate || null,
//         cancelledBooking: cancelledBooking || null,
//       },

//       payments,
//       ledgers,
//     };

//     return res.status(200).json(response);

//   } catch (err) {
//     console.error("Get Invoice Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };


// exports.getAllInvoices = async (req, res) => {
//   try {
//     const { page = 1, limit = 100 } = req.query;
//     const offset = (page - 1) * limit;

//     const invoices = await Invoice.findAndCountAll({
//       limit: Number(limit),
//       offset: Number(offset),
//       order: [["id", "DESC"]],
//       include: [
//         {
//           model: Client,
//           as: "client",
//           attributes: ["id", "name", "email", "phone"],
//           required: false,
//         },
//         {
//           model: User,
//           as: "agent",
//           attributes: ["id", "name", "email", "role"],
//           required: false,
//         },
//         {
//           model: Company,
//           as: "company",
//           attributes: ["id", "Name", "email", "phone", "gstNumber"],
//           required: false,
//         },
//         { model: FlightBooking, as: "flightBooking", required: false },
//         { model: BusBooking, as: "busBooking", required: false },
//         { model: RailwayBooking, as: "railBooking", required: false },
//         { model: BookingUpdate, as: "bookingUpdate", required: false },
//       ],
//     });

//  const invoicesWithBooking = await Promise.all(
//   invoices.rows.map(async (inv) => {
//     let booking = null;
//     let bookingType = inv.bookingType;

//     if (bookingType === "flight") {
//       booking = await FlightBooking.findByPk(inv.bookingId);
//     } else if (bookingType === "bus") {
//       booking = await BusBooking.findByPk(inv.bookingId);
//     } else if (bookingType === "rail") {
//       booking = await RailwayBooking.findByPk(inv.bookingId);
//     } else if (bookingType === "update") {
//       booking = await BookingUpdate.findByPk(inv.bookingId);
//     }

//     return {
//       ...inv.dataValues,
//       booking,
//       bookingType,
//     };
//   })
//  );

//     return res.status(200).json({
//       success: true,
//       total: invoices.count,
//       invoices: invoicesWithBooking,
//       page: Number(page),
//       totalPages: Math.ceil(invoices.count / limit),
//     });
//   } catch (err) {
//     console.error("Get All Invoices Error:", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };


const Invoice = require("../models/invoicesModel");
const Payment = require("../models/paymentModel");
const Ledger = require("../models/ledgerModel");
const BookingUpdate = require("../models/bookingUpdateModel");

const User = require("../models/userModel");
const Company = require("../models/companyModel");
const CancelledBooking = require("../models/cancelledBookingModel");
const Passenger = require("../models/passengerModel");
const generateBillNo = require("../utils/billNoGenerator");
const { Op } = require("sequelize");

const {
  Client,
  FlightBooking,
  BusBooking,
  RailwayBooking,
} = require("../models/associations");


exports.createInvoice = async (req, res) => {
  try {
    const { totalAmount, bookingUpdateId } = req.body;
    const currentUserId = req.user.id;

    if (!totalAmount || !bookingUpdateId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const booking = await BookingUpdate.findByPk(bookingUpdateId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking update not found",
      });
    }

    const billNo = await generateBillNo();

    const invoice = await Invoice.create({
      billNo,
      type: "booking-update",
      totalAmount,
      clientId: booking.clientId,
      agentId: booking.agentId,
      bookingId: booking.id,
      bookingType: "update",
      createdBy: currentUserId,
      reference: `Booking Update #${booking.id}`,
    });

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice,
    });
  } catch (err) {
    console.error("Create Invoice Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};




exports.getInvoiceByBillNo = async (req, res) => {
  try {
    const { billNo } = req.params;
    const { role, id: userId } = req.user;

    if (!billNo) {
      return res.status(400).json({ success: false, message: "billNo is required" });
    }

    const isAgent = role?.toLowerCase() === "agent";

    const where = { billNo };
    if (isAgent) where.createdBy = userId;

    const invoice = await Invoice.findOne({
      where,
      include: [
        { model: Client, as: "client" },
        { model: User, as: "agent" },
        { model: Company, as: "company" },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }



    let booking = null;
    let passengers = [];

    if (invoice.bookingType === "flight") {
      booking = await FlightBooking.findByPk(invoice.bookingId);
      passengers = await Passenger.findAll({
        where: { bookingId: invoice.bookingId, type: "flight" },
      });
    } 
    else if (invoice.bookingType === "bus") {
      booking = await BusBooking.findByPk(invoice.bookingId);
      passengers = await Passenger.findAll({
        where: { bookingId: invoice.bookingId, type: "bus" },
      });
    } 
    else if (invoice.bookingType === "rail") {
      booking = await RailwayBooking.findByPk(invoice.bookingId);
      passengers = await Passenger.findAll({
        where: { bookingId: invoice.bookingId, type: "rail" },
      });
    }



    const bookingUpdate = await BookingUpdate.findOne({
      where: {
        bookingId: invoice.bookingId,
        bookingType: invoice.bookingType,
      },
      order: [["createdAt", "DESC"]],
    });



    const cancelledBooking = await CancelledBooking.findOne({
      where: { billNo },
    });


    const payments = await Payment.findAll({
      where: { billNo },
      order: [["createdAt", "ASC"]],
    });

    const ledgers = await Ledger.findAll({
      where: { billNo },
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      invoice: {
        billNo: invoice.billNo,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
        company: invoice.company,
        agent: invoice.agent,
        client: invoice.client,
        booking,
        passengers,
        bookingUpdate,
        cancelledBooking,
      },
      payments,
      ledgers,
    });

  } catch (err) {
    console.error("Get Invoice Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// exports.getInvoiceByBillNo = async (req, res) => {
//   try {
//     const { billNo } = req.params;
//     const { role, id: userId } = req.user;

//     if (!billNo) {
//       return res
//         .status(400)
//         .json({ success: false, message: "billNo is required" });
//     }

//     const isAgent = role?.toLowerCase() === "agent";

//     const where = { billNo };
//     if (isAgent) where.createdBy = userId;

//     const invoice = await Invoice.findOne({
//       where,
//       include: [
//         { model: Client, as: "client" },
//         { model: User, as: "agent" },
//         { model: Company, as: "company" },
//       ],
//     });

//     if (!invoice) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Invoice not found" });
//     }


//     let booking = null;
//     let passengers = [];

//     if (invoice.bookingType === "flight") {
//       booking = await FlightBooking.findByPk(invoice.bookingId);
//       passengers = await Passenger.findAll({
//         where: { bookingId: invoice.bookingId, type: "flight" },
//       });
//     } else if (invoice.bookingType === "bus") {
//       booking = await BusBooking.findByPk(invoice.bookingId);
//       passengers = await Passenger.findAll({
//         where: { bookingId: invoice.bookingId, type: "bus" },
//       });
//     } else if (invoice.bookingType === "rail") {
//       booking = await RailwayBooking.findByPk(invoice.bookingId);
//       passengers = await Passenger.findAll({
//         where: { bookingId: invoice.bookingId, type: "rail" },
//       });
//     }


//     const bookingUpdate = await BookingUpdate.findOne({
//       where: {
//         bookingId: invoice.bookingId,
//         bookingType: invoice.bookingType,
//       },
//       order: [["createdAt", "DESC"]],
//     });


//     const cancelledBooking = await CancelledBooking.findOne({
//       where: { billNo },
//     });

//     const cancellationCharge = cancelledBooking
//       ? Number(cancelledBooking.cancellationCharge || 0)
//       : 0;

//     const serviceChargeCancellation = cancelledBooking
//       ? Number(cancelledBooking.serviceChargeCancellation || 0)
//       : 0;


//     const payments = await Payment.findAll({
//       where: { billNo },
//       order: [["createdAt", "ASC"]],
//     });

//     const totalPaidAmount = payments.reduce(
//       (sum, p) => sum + Number(p.amount || 0),
//       0
//     );


//     const ledgers = await Ledger.findAll({
//       where: { billNo },
//       order: [["createdAt", "ASC"]],
//     });

  
//     const totalTicketAmount = Number(invoice.totalAmount || 0);

//     let remainingAmount =
//       totalTicketAmount -
//       totalPaidAmount +
//       cancellationCharge +
//       serviceChargeCancellation;

//     if (remainingAmount < 0) remainingAmount = 0;

//     return res.status(200).json({
//       success: true,

//       invoice: {
//         billNo: invoice.billNo,
//         bookingType: invoice.bookingType,
//         createdAt: invoice.createdAt,
//         updatedAt: invoice.updatedAt,
//         company: invoice.company,
//         agent: invoice.agent,
//         client: invoice.client,
//         booking,
//         passengers,
//         bookingUpdate,
//         cancelledBooking,
//       },

//       payments,
//       ledgers,

//       paymentSummary: {
//         totalTicketAmount,
//         totalPaidAmount,
//         cancellationCharge,
//         serviceChargeCancellation,
//         remainingAmount,
//       },
//     });
//   } catch (err) {
//     console.error("Get Invoice Error:", err);
//     return res
//       .status(500)
//       .json({ success: false, message: err.message });
//   }
// };


exports.getAllInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const { role, id: userId } = req.user;

    const offset = (page - 1) * limit;
    const isAgent = role?.toLowerCase() === "agent";

    const where = {};
    if (isAgent) {
      where.createdBy = userId;
    }

    // const invoices = await Invoice.findAndCountAll({
    //   where,
    //   limit: Number(limit),
    //   offset: Number(offset),
    //   order: [["id", "DESC"]],
    //   include: [
    //     {
    //       model: Client,
    //       as: "client",
    //       attributes: ["id", "name", "email", "phone"],
    //       required: false,
    //     },
    //     {
    //       model: User,
    //       as: "agent",
    //       attributes: ["id", "name", "email", "role"],
    //       required: false,
    //     },
    //     {
    //       model: Company,
    //       as: "company",
    //       attributes: ["id", "Name", "email", "phone", "gstNumber"],
    //       required: false,
    //     },
    //     { model: FlightBooking, as: "flightBooking", required: false },
    //     { model: BusBooking, as: "busBooking", required: false },
    //     { model: RailwayBooking, as: "railBooking", required: false },
    //     // { model: BookingUpdate, as: "bookingUpdate", required: false },
    //   ],
    // });

    const invoices = await Invoice.findAndCountAll({
  where,
  limit: Number(limit),
  offset: Number(offset),
  order: [["id", "DESC"]],
  distinct: true,
  subQuery: false,
  include: [
    {
      model: Client,
      as: "client",
      attributes: ["id", "name", "email", "phone"],
      required: false,
    },
    {
      model: User,
      as: "agent",
      attributes: ["id", "name", "email", "role"],
      required: false,
    },
    {
      model: Company,
      as: "company",
      attributes: ["id", "Name", "email", "phone", "gstNumber"],
      required: false,
    },
    { model: FlightBooking, as: "flightBooking", required: false },
    { model: BusBooking, as: "busBooking", required: false },
    { model: RailwayBooking, as: "railBooking", required: false },
  ],
});

    const invoicesWithBooking = await Promise.all(
      invoices.rows.map(async (inv) => {
        let booking = null;

        if (inv.bookingType === "flight") {
          booking = await FlightBooking.findByPk(inv.bookingId);
        } else if (inv.bookingType === "bus") {
          booking = await BusBooking.findByPk(inv.bookingId);
        } else if (inv.bookingType === "rail") {
          booking = await RailwayBooking.findByPk(inv.bookingId);
        } else if (inv.bookingType === "update") {
          booking = await BookingUpdate.findByPk(inv.bookingId);
        }

        return {
          ...inv.dataValues,
          booking,
        };
      })
    );

    return res.status(200).json({
      success: true,
      total: invoices.count,
      invoices: invoicesWithBooking,
      page: Number(page),
      totalPages: Math.ceil(invoices.count / limit),
    });
  } catch (err) {
    console.error("Get All Invoices Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
