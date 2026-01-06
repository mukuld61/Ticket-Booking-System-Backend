const User = require("./userModel");
const FlightBooking = require("./bookingFlightModel");
const BusBooking = require("./bookingBusModel");
const RailwayBooking = require("./bookingRailModel");
const BookingUpdate = require("./bookingUpdateModel");
const CancelledBooking = require("./cancelledBookingModel");
const Client = require("./clientModel");                                                              
const Company = require("./companyModel");
const Invoice = require("./invoicesModel");
const Ledger = require("./ledgerModel");

User.hasMany(FlightBooking, { foreignKey: "createdBy", as: "flightBookings" });
FlightBooking.belongsTo(User, { foreignKey: "createdBy", as: "createdByUser" });

User.hasMany(BusBooking, { foreignKey: "createdBy", as: "busBookings" });
BusBooking.belongsTo(User, { foreignKey: "createdBy", as: "createdByUser" });

User.hasMany(RailwayBooking, { foreignKey: "createdBy", as: "railwayBookings" });
RailwayBooking.belongsTo(User, { foreignKey: "createdBy", as: "createdByUser" });


BookingUpdate.belongsTo(User, { as: "updater", foreignKey: "updatedBy" });



CancelledBooking.belongsTo(BookingUpdate, {
  foreignKey: "bookingId",
  as: "booking",
});



Client.hasMany(BookingUpdate, {
  foreignKey: "clientId",
  as: "bookings",
});

Invoice.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Invoice.belongsTo(User, { foreignKey: "agentId", as: "agent" });
Invoice.belongsTo(Company, { foreignKey: "companyId", as: "company" });


Invoice.belongsTo(FlightBooking, {
  foreignKey: "bookingId",
  as: "flightBooking",
  constraints: false,
});

Invoice.belongsTo(BusBooking, {
  foreignKey: "bookingId",
  as: "busBooking",
  constraints: false,
});

Invoice.belongsTo(RailwayBooking, {
  foreignKey: "bookingId",
  as: "railBooking",
  constraints: false,
});



// Invoice.hasOne(BookingUpdate, {
//   foreignKey: "bookingId",
//   sourceKey: "bookingId",
//   as: "bookingUpdate",
// });

// BookingUpdate.belongsTo(Invoice, {
//   foreignKey: "bookingId",
//   targetKey: "bookingId",
// });

Invoice.hasOne(CancelledBooking, {
  foreignKey: "billNo",
  sourceKey: "billNo",
  as: "cancelledBooking",
});

CancelledBooking.belongsTo(Invoice, {
  foreignKey: "billNo",
  targetKey: "billNo",
});

// Ledger.belongsTo(Client, {
//   foreignKey: "clientId",
//   as: "ledgerClient",
// });

// Ledger.belongsTo(User, {
//   foreignKey: "createdBy",
//   as: "createdByUser",
// });

// BookingUpdate.belongsTo(Client, {
//   foreignKey: "clientId",
//   as: "client"
// });




BookingUpdate.belongsTo(Invoice, {
  foreignKey: "bookingId",
  targetKey: "id",
  as: "invoice"
});

BookingUpdate.belongsTo(FlightBooking, {
  foreignKey: "bookingId",
  constraints: false,
  as: "flightBooking"
});

BookingUpdate.belongsTo(BusBooking, {
  foreignKey: "bookingId",
  constraints: false,
  as: "busBooking"
});

BookingUpdate.belongsTo(RailwayBooking, {
  foreignKey: "bookingId",
  constraints: false,
  as: "railBooking"
});


module.exports = { User, FlightBooking, BusBooking, RailwayBooking ,BookingUpdate,CancelledBooking,Client,Company,Ledger,Invoice  };
