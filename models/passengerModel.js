const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Passenger = sequelize.define(
  "Passenger",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
          clientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    honorifics: { type: DataTypes.STRING, allowNull: false }, 
    bookingId: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM("bus", "flight", "rail"), allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    gender: { type: DataTypes.ENUM("Male", "Female", "Other"), allowNull: false },
  },
  {
    tableName: "Passengers",
    timestamps: true, 
  }
);

module.exports = Passenger;
