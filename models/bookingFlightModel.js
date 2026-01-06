const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Client = require("./clientModel");
const Passenger = require("./passengerModel");
const User = require("./userModel");
const Company = require("./companyModel");
// const TripDetails = require("./tripDetailsModel");

const BookingFlight = sequelize.define(
  "BookingFlight",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    clientId: { type: DataTypes.INTEGER, allowNull: false },
      companyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "companies",
      key: "id",
    },
  },
    clientSnapshotName: { type: DataTypes.STRING, allowNull: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: true },
  
    flightNumber: { type: DataTypes.STRING, allowNull: false },
    travelClass: { type: DataTypes.STRING, allowNull: false },
    fromAirport: { type: DataTypes.STRING, allowNull: false },
    toAirport: { type: DataTypes.STRING, allowNull: false },
    departureDateTime: {    type: DataTypes.DATEONLY, 
    defaultValue: DataTypes.NOW, },

    totalPassengers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    airline: { type: DataTypes.STRING, allowNull: true },
boardingPoint: {
  type: DataTypes.STRING,
  allowNull: true,
},

    totalAmount: {
  type: DataTypes.DECIMAL(10,2),
  allowNull: true,
},


    bookingStatus: {
      type: DataTypes.ENUM("pending", "confirmed", "cancelled"),
      defaultValue: "pending",
    },
bookedBy: {
  type: DataTypes.INTEGER,
  allowNull: false,
},
    status: {
      type: DataTypes.ENUM("Pending", "Confirmed", "Cancelled"),
      allowNull: false,
      defaultValue: "Pending",
    },

    ticketStatus: {
      type: DataTypes.ENUM("Pending", "Confirmed", "Cancelled","Waiting"),
      defaultValue: "Pending",
    },
      

  tripType: {
    type: DataTypes.ENUM('single', 'round', 'multi'),
    defaultValue: 'single'
  },
// tripGroupId: {
//   type: DataTypes.STRING,
//   allowNull: true
// }


  },
  {
    tableName: "BookingFlights",
    timestamps: true,
  }
);

BookingFlight.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Client.hasMany(BookingFlight, { foreignKey: "clientId", as: "flightBookings" });

BookingFlight.hasMany(Passenger, { foreignKey: "bookingId", as: "flightPassengers" });
Passenger.belongsTo(BookingFlight, { foreignKey: "bookingId", as: "flightBooking" });

BookingFlight.belongsTo(User, { foreignKey: "bookedBy", as: "bookedByUser" });
BookingFlight.belongsTo(Company, { foreignKey: "companyId", as: "company" });

// BookingFlight.hasMany(TripDetails, {
//   foreignKey: 'bookingId',
//   constraints: false,
//   scope: { bookingType: 'flight' },
//   as: 'tripDetails'
// });

// TripDetails.belongsTo(BookingFlight, {
//   foreignKey: 'bookingId',
//   constraints: false,
//   as: 'flightBooking'
// });

module.exports = BookingFlight;
