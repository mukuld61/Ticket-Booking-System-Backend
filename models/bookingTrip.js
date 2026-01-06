const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const BookingTrip = sequelize.define(
  "BookingTrip",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    bookingType: {
      type: DataTypes.ENUM("flight", "bus", "rail"),
      allowNull: false,
    },

    fromLocation: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    toLocation: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    boardingPoint: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    journeyDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    airline: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    travelClass: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    
      busType: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      seatType: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      seatNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
  },
  {
    tableName: "BookingTrips",
    timestamps: true, 
  }
);

module.exports = BookingTrip;
