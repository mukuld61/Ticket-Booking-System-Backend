// models/invoiceModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Invoice = sequelize.define(
  "Invoice",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    companyId: { type: DataTypes.INTEGER, allowNull: true },
    clientId: { type: DataTypes.INTEGER, allowNull: true },
    agentId: { type: DataTypes.INTEGER, allowNull: true },
    bookingId: { type: DataTypes.INTEGER, allowNull: true },
    bookingType: { type: DataTypes.ENUM("flight", "bus", "rail"), allowNull: true },
    // bookingUpdateId: { type: DataTypes.INTEGER, allowNull: true },
    flightBookingId: { type: DataTypes.INTEGER, allowNull: true },
    busBookingId: { type: DataTypes.INTEGER, allowNull: true },
    railBookingId: { type: DataTypes.INTEGER, allowNull: true },
    billNo: { type: DataTypes.STRING(64), allowNull: false },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "payment",
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    createdBy: { type: DataTypes.INTEGER, allowNull: true },
    reference: { type: DataTypes.STRING(255), allowNull: true },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "issued",
    },
  },
  {
    tableName: "Invoices",
    timestamps: true,
  }
);

module.exports = Invoice;
