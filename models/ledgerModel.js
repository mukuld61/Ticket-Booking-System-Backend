const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Client = require("./clientModel");
const User = require("./userModel");
const FlightBooking = require("./bookingFlightModel");
const BusBooking = require("./bookingBusModel");
const RailBooking = require("./bookingRailModel");
const Invoice = require("./invoicesModel");
const BookingUpdate = require("./bookingUpdateModel");
const Ledger = sequelize.define(
  "Ledger",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },


    agentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    bookingType: {
      type: DataTypes.ENUM("flight", "bus", "rail"),
      allowNull: true,
    },

    entryType: {
      type: DataTypes.ENUM("credit", "debit"),
      allowNull: false,
      comment: "credit = received, debit = paid/refund",
    },

    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    balanceAfter: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },

    billNo: { type: DataTypes.STRING(64), allowNull: true },

    paymentMode: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    transactionDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "LedgerEntries",
    timestamps: true,
  }
);


// Ledger.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Client.hasMany(Ledger, { foreignKey: "clientId", as: "ledgerEntries" });

Ledger.belongsTo(User, { foreignKey: "createdBy", as: "createdByUser" });
User.hasMany(Ledger, { foreignKey: "createdBy", as: "userLedgerEntries" });

Ledger.belongsTo(Client, { foreignKey: "clientId", as: "client" });

Ledger.belongsTo(FlightBooking, { foreignKey: "bookingId", as: "flightBooking" });
Ledger.belongsTo(BusBooking, { foreignKey: "bookingId", as: "busBooking" });
Ledger.belongsTo(RailBooking, { foreignKey: "bookingId", as: "railBooking" });

Ledger.belongsTo(Invoice, {
  foreignKey: "billNo",
  targetKey: "billNo",
  as: "invoice"
});

Ledger.belongsTo(BookingUpdate, {
  foreignKey: "bookingId",
  targetKey: "bookingId",
  constraints: false,
  as: "bookingUpdate"
});

module.exports = Ledger;
