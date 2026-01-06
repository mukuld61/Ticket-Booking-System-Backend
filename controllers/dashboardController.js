const Bus = require("../models/bookingBusModel");
const Flight = require("../models/bookingFlightModel");
const  Railway = require("../models/bookingRailModel");
const User = require("../models/userModel");
const Client = require("../models/clientModel");
const Invoice = require("../models/invoicesModel");  
const CancelledBooking = require("../models/cancelledBookingModel");
const { Op } = require("sequelize");
const user = require("../models/userModel");


exports.getBookingStats = async (req, res) => {
  try {

    const { role, id } = req.user; 
     const condition = role === "agent" ? { createdBy: id } : {};
    let railwayCount, busCount, flightCount;

    if (role === "admin") {
  
      [railwayCount, busCount, flightCount] = await Promise.all([
        Railway.count(),
        Bus.count(),
        Flight.count(),
      ]);
    } else if (role === "agent") {
   
      [railwayCount, busCount, flightCount] = await Promise.all([
      Railway.count({ where: { bookedBy: id } }),
  Bus.count({ where: { bookedBy: id } }),
  Flight.count({ where: { bookedBy: id } }),

      ]);
    } else {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    res.json({
      railwayCount,
      busCount,
      flightCount,
      totalBookings: railwayCount + busCount + flightCount,
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ message: "Server Error" });
  }
};



exports.getAllBookings = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    // const condition = role === "agent" ? { createdBy: userId } : {};
    const condition = role === "agent" ? { bookedBy: userId } : {};


    const [railways, buses, flights] = await Promise.all([
      Railway.findAll({
        where: condition,
       
        include: [{ model: User, as: "bookedByUser", attributes: ["id", "name", "role"] }],
         order: [["createdAt", "DESC"]],
      }),
      Bus.findAll({
        where: condition,
       
        include: [{ model: User, as: "bookedByUser", attributes: ["id", "name", "role"] }],
         order: [["createdAt", "DESC"]],
      }),
      Flight.findAll({
        where: condition,
    
        include: [{ model: User, as: "bookedByUser", attributes: ["id", "name", "role"] }],
         order: [["createdAt", "DESC"]],
      }),
    ]);

    const formatBooking = (booking, type) => ({
      id: booking.id,
      // _id: booking._id,
      type,
      bookingStatus: booking.status,
      ticketStatus: booking.ticketStatus,
      status: booking.status,
      journeyDate:
      booking.departureDateTime || booking.departureDate || booking.journeyDate || null,
      bookedBy: booking.bookedByUser ? booking.bookedByUser.name : "Unknown",
      agentId: booking.createdBy,
      clientName: booking.clientName,
      from: booking.fromStation || booking.fromStop || booking.fromAirport,
      to: booking.toStation || booking.toStop || booking.toAirport,
      totalAmount: booking.totalAmount || 0,
      clientSnapshotName:booking.clientSnapshotName,
      createdAt: booking.createdAt,
    });

    const allBookings = [
      ...railways.map((r) => formatBooking(r, "Railway")),
      ...buses.map((b) => formatBooking(b, "Bus")),
      ...flights.map((f) => formatBooking(f, "Flight")),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      total: allBookings.length,
      bookings: allBookings,
    });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// exports.getAllBookings = async (req, res) => {
//   try {
//     const { role, id: userId } = req.user;

//     const condition = role === "agent" ? { bookedBy: userId } : {};

//     const includeConfig = [
//       {
//         model: User,
//         as: "bookedByUser",
//         attributes: ["id", "name", "role"],
//       },
//       {
//         model: Client,
//         as: "client",
//         attributes: ["id", "name", "email", "phone"],
//         required: false,
//       },
//     ];

//     const [rails, buses, flights] = await Promise.all([
//       Railway.findAll({ where: condition, include: includeConfig }),
//       Bus.findAll({ where: condition, include: includeConfig }),
//       Flight.findAll({ where: condition, include: includeConfig }),
//     ]);

//     const formatBooking = (b, type) => ({
//       // IMPORTANT: send both
//       id: b.id,
//       bookingId: b.id,

//       type,

//       bookingStatus: b.status,
//       ticketStatus: b.ticketStatus,

//       journeyDate:
//         b.departureDateTime ||
//         b.departureDate ||
//         b.journeyDate ||
//         null,

//       bookedBy: b.bookedByUser?.name || "Unknown",

  
//       clientSnapshotName:
//         b.client?.name ||
//         b.clientSnapshotName ||
//         "Unknown",

//       client: b.client
//         ? {
//             id: b.client.id,
//             name: b.client.name,
//             email: b.client.email,
//             phone: b.client.phone,
//           }
//         : null,

//       from: b.fromStation || b.fromStop || b.fromAirport,
//       to: b.toStation || b.toStop || b.toAirport,

//       totalAmount: Number(b.totalAmount || 0),

//       createdAt: b.createdAt,
//     });

//     const bookings = [
//       ...rails.map((r) => formatBooking(r, "Railway")),
//       ...buses.map((b) => formatBooking(b, "Bus")),
//       ...flights.map((f) => formatBooking(f, "Flight")),
//     ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//     return res.status(200).json({
//       success: true,
//       total: bookings.length,
//       bookings,
//     });
//   } catch (err) {
//     console.error("getAllBookings error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: err.message,
//     });
//   }
// };



// exports.getAgentBookings = async (req, res) => {
//   try {
//     const { agentId } = req.params;

//     // ✅ Fetch all bookings where bookedBy = agentId (or name, depending on what you store)
//     const railwayBookings = await railwayBookings.findAll({ where: { bookedBy: agentId } });
//     const busBookings = await busBookings.findAll({ where: { bookedBy: agentId } });
//     const flightBookings = await flightBookings.findAll({ where: { bookedBy: agentId } });

//     // ✅ Merge all into one list
//     const allBookings = [
//       ...railwayBookings.map(b => ({ ...b.toJSON(), type: "Railway" })),
//       ...busBookings.map(b => ({ ...b.toJSON(), type: "Bus" })),
//       ...flightBookings.map(b => ({ ...b.toJSON(), type: "Flight" })),
//     ];

//     res.status(200).json({
//       success: true,
//       count: allBookings.length,
//       bookings: allBookings,
//     });
//   } catch (err) {
//     console.error("Error fetching agent bookings:", err);
//     res.status(500).json({ message: "Error fetching agent bookings", error: err.message });
//   }
// };


exports.getAgentBookings = async (req, res) => {
  try {
    const { agentId } = req.params;

  
    const [railwayBookings, busBookings, flightBookings] = await Promise.all([
      Railway.findAll({
        where: { bookedBy: agentId },
        include: [{ model: Client, as: "client", attributes: ["id", "name", "email"] }],
              order: [["createdAt", "DESC"]],
      }),
      Bus.findAll({
        where: { bookedBy: agentId },
        include: [{ model: Client, as: "client", attributes: ["id", "name", "email"] }],
              order: [["createdAt", "DESC"]],
      }),
      Flight.findAll({
        where: { bookedBy: agentId },
        include: [{ model: Client, as: "client", attributes: ["id", "name", "email"] }],
              order: [["createdAt", "DESC"]],
      }),
    ]);

    const allBookings = [
      ...railwayBookings.map(b => ({ ...b.toJSON(), type: "Railway" })),
      ...busBookings.map(b => ({ ...b.toJSON(), type: "Bus" })),
      ...flightBookings.map(b => ({ ...b.toJSON(), type: "Flight" })),
    ];

    res.status(200).json({
      success: true,
      count: allBookings.length,
      bookings: allBookings,
    });
  } catch (err) {
    console.error("Error fetching agent bookings:", err);
    res.status(500).json({ message: "Error fetching agent bookings", error: err.message });
  }
};



exports.getDashboardStats = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
// console.log("Dashboard role:", role);

    const isAgent = role?.toLowerCase() === "agent";

    const bookingFilter = isAgent ? { bookedBy: userId } : {};

 
    let totalAgents = 0;
    if (!isAgent) {
      totalAgents = await User.count({
        where: { role: "agent" },
      });
    }

    const [busTotal, railTotal, flightTotal] = await Promise.all([
      Bus.count({ where: bookingFilter }),
      Railway.count({ where: bookingFilter }),
      Flight.count({ where: bookingFilter }),
    ]);

    const totalBookings = busTotal + railTotal + flightTotal;


    const activeStatusCondition = {
      [Op.or]: [{ ticketStatus: "Confirmed" }, { ticketStatus: "Waiting" }],
    };

    const [busActive, railActive, flightActive] = await Promise.all([
      Bus.count({
        where: { ...bookingFilter, ...activeStatusCondition },
      }),
      Railway.count({
        where: { ...bookingFilter, ...activeStatusCondition },
      }),
      Flight.count({
        where: { ...bookingFilter, ...activeStatusCondition },
      }),
    ]);

    const activeBookings = busActive + railActive + flightActive;


    const [busRevenue, railRevenue, flightRevenue] = await Promise.all([
      Bus.sum("totalAmount", { where: bookingFilter }),
      Railway.sum("totalAmount", { where: bookingFilter }),
      Flight.sum("totalAmount", { where: bookingFilter }),
    ]);

    const totalRevenue =
      (busRevenue || 0) + (railRevenue || 0) + (flightRevenue || 0);

    return res.status(200).json({
      success: true,
      data: {
        totalAgents,
        totalBookings,
        activeBookings,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};





exports.getAgentDashboard = async (req, res) => {
  try {
  
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { role, id: userId } = req.user;

  
    if (role?.toLowerCase() !== "agent") {
      return res.status(403).json({ success: false, message: "Forbidden: Not an agent" });
    }

    const agentBookingFilter = { bookedBy: userId };
    const agentCancelledFilter = { cancelledBy: userId };
    const agentInvoiceFilter = { createdBy: userId };

  
    const [busTotal, railTotal, flightTotal] = await Promise.all([
      Bus.count({ where: agentBookingFilter }),
      Railway.count({ where: agentBookingFilter }),
      Flight.count({ where: agentBookingFilter }),
    ]);
    const totalBookings = busTotal + railTotal + flightTotal;

    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [busToday, railToday, flightToday] = await Promise.all([
      Bus.count({ where: { ...agentBookingFilter, createdAt: { [Op.between]: [todayStart, todayEnd] } } }),
      Railway.count({ where: { ...agentBookingFilter, createdAt: { [Op.between]: [todayStart, todayEnd] } } }),
      Flight.count({ where: { ...agentBookingFilter, createdAt: { [Op.between]: [todayStart, todayEnd] } } }),
    ]);
    const todayBookings = busToday + railToday + flightToday;


    const statusFilter = { [Op.or]: [{ ticketStatus: "Confirmed" }, { ticketStatus: "Waiting" }] };
    const [busActive, railActive, flightActive] = await Promise.all([
      Bus.count({ where: { ...statusFilter, ...agentBookingFilter } }),
      Railway.count({ where: { ...statusFilter, ...agentBookingFilter } }),
      Flight.count({ where: { ...statusFilter, ...agentBookingFilter } }),
    ]);
    const activeBookings = busActive + railActive + flightActive;

    const cancelledBookings = await CancelledBooking.count({
      where: agentCancelledFilter,
    });


    const invoices = await Invoice.findAll({ where: agentInvoiceFilter });
    const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
    const todayRevenue = invoices
      .filter(inv => new Date(inv.createdAt) >= todayStart && new Date(inv.createdAt) <= todayEnd)
      .reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        totalBookings,
        todayBookings,
        activeBookings,
        cancelledBookings,
        totalRevenue,
        todayRevenue,
      },
    });

  } catch (err) {
    console.error("Error in agent dashboard:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};