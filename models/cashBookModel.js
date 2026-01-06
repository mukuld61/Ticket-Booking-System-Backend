const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Ledger = sequelize.define(
  "CashBook",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    clientId: { type: DataTypes.INTEGER, allowNull: true },
    bookingId: { type: DataTypes.INTEGER, allowNull: true },
    bookingType: {
      type: DataTypes.ENUM("flight", "bus", "rail"),
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    purpose: { type: DataTypes.STRING, allowNull: true },
    remark: { type: DataTypes.STRING, allowNull: true },
    entryType: { type: DataTypes.ENUM("credit", "debit"), allowNull: false },
    paymentMode: { type: DataTypes.STRING, allowNull: true },
    reference: { type: DataTypes.STRING, allowNull: true },
    billNo: { type: DataTypes.STRING(64), allowNull: true },
    transactionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    createdBy: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "CashBook",
    timestamps: true,
  }
);

module.exports = Ledger;
