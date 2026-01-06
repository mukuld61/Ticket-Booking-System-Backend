
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Client = require("./clientModel");
const Passenger = require("./passengerModel");
const User = require("./userModel");
const Company = require("./companyModel");
// const TripDetails = require("./tripDetailsModel");

const BookingBus = sequelize.define("BookingBus", {
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
  clientSnapshotName: { type: DataTypes.STRING },
  busNumber: { type: DataTypes.STRING },
  fromStop: { type: DataTypes.STRING, allowNull: false },
  toStop: { type: DataTypes.STRING, allowNull: false },
  departureDateTime: {    type: DataTypes.DATEONLY, 
    defaultValue: DataTypes.NOW, },
  seatType: { type: DataTypes.STRING },
  totalPassengers: { type: DataTypes.INTEGER, defaultValue: 1 },

  bookingStatus: { type: DataTypes.STRING, defaultValue: "pending" },
  createdBy: { type: DataTypes.INTEGER },
bookedBy: {
  type: DataTypes.INTEGER,
  allowNull: false,
},

    companyType: {
    type: DataTypes.STRING,
    allowNull: true,

  },
  busType: {
  type: DataTypes.STRING,
  allowNull: true,
},
boardingPoint: {
  type: DataTypes.STRING,
  allowNull: true,
},

seatNumber: {
  type: DataTypes.STRING,
  allowNull: true,
},
totalAmount: {
  type: DataTypes.DECIMAL(10,2),
  allowNull: true,
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


},{
  tableName: "BookingBuses",
  timestamps: true,
}
);


Client.hasMany(BookingBus, { foreignKey: "clientId", as: "busBookings" });
BookingBus.belongsTo(Client, { foreignKey: "clientId", as: "client" });


BookingBus.hasMany(Passenger, { foreignKey: "bookingId", as: "busPassengers" });
Passenger.belongsTo(BookingBus, { foreignKey: "bookingId", as: "busBooking" });

BookingBus.belongsTo(User, { foreignKey: "bookedBy", as: "bookedByUser" });
BookingBus.belongsTo(Company, { foreignKey: "companyId", as: "company" });


// BookingBus.hasMany(TripDetails, {
//   foreignKey: 'bookingId',
//   constraints: false,
//   scope: { bookingType: 'bus' },
//   as: 'tripDetails'
// });

// TripDetails.belongsTo(BookingBus, {
//   foreignKey: 'bookingId',
//   constraints: false,
//   as: 'busBooking'
// });

module.exports = BookingBus;  