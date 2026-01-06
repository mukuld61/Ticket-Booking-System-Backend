const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CashBookDailyBalance = sequelize.define(
  "CashBookDailyBalance",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    balanceDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true,
    },

    openingBalance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },

    closingBalance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "cash_book_daily_balance",
    timestamps: true,
  }
);

module.exports = CashBookDailyBalance;
