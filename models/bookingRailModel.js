
// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");
// const Client = require("./clientModel");
// const Passenger = require("./passengerModel");
// const User = require("./userModel");
// const Company = require("./companyModel");
// const BookingRail = sequelize.define(
//   "BookingRail",
//   {
//     id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

//     clientId: { type: DataTypes.INTEGER, allowNull: false },
//       companyId: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     references: {
//       model: "companies",
//       key: "id",
//     },
//   },
//     clientSnapshotName: { type: DataTypes.STRING, allowNull: true },
//     createdBy: { type: DataTypes.INTEGER, allowNull: true },

//     trainNumber: { type: DataTypes.STRING, allowNull: false },
//     classType: { type: DataTypes.STRING, allowNull: true },
//     fromStation: { type: DataTypes.STRING, allowNull: false },
//     toStation: { type: DataTypes.STRING, allowNull: false },
//     departureDate: {    type: DataTypes.DATEONLY,
//     defaultValue: DataTypes.NOW,},

//     totalPassengers: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       defaultValue: 1,
//     },
//     fare: { type: DataTypes.DECIMAL(10, 2), allowNull: true },

//     bookingStatus: {
//       type: DataTypes.ENUM("pending", "confirmed", "cancelled"),
//       defaultValue: "pending",
//     },
// bookedBy: {
//   type: DataTypes.INTEGER,
//   allowNull: false,
// },
// status: {
//   type: DataTypes.ENUM("Pending", "Confirmed", "Cancelled"),
//   allowNull: false,
//   defaultValue: "Pending",
// },
//   ticketStatus: {
//   type: DataTypes.ENUM("Confirmed", "Cancelled"),
//   defaultValue: "Confirmed",
// },
// },
//   {
//     tableName: "BookingRails",
//     timestamps: true,
//   }
// );
// BookingRail.belongsTo(Client, { foreignKey: "clientId", as: "client" });
// Client.hasMany(BookingRail, { foreignKey: "clientId", as: "railBookings" });


// BookingRail.hasMany(Passenger, { foreignKey: "bookingId", as: "railPassengers" });
// Passenger.belongsTo(BookingRail, { foreignKey: "bookingId", as: "railBooking" });

// BookingRail.belongsTo(User, { foreignKey: "bookedBy", as: "bookedByUser" });

// BookingRail.belongsTo(Company, { foreignKey: "companyId", as: "company" });
// module.exports = BookingRail;


const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Client = require("./clientModel");
const Passenger = require("./passengerModel");
const User = require("./userModel");
const Company = require("./companyModel");

const BookingRail = sequelize.define(
  "BookingRail",
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

    trainNumber: { type: DataTypes.STRING, allowNull: false },
        trainName: {
      type: DataTypes.STRING,
      allowNull: true,
    },



    classType: { type: DataTypes.STRING, allowNull: true },
    fromStation: { type: DataTypes.STRING, allowNull: false },
    toStation: { type: DataTypes.STRING, allowNull: false },
    departureDate: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },

    totalPassengers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    boardingPoint: {
  type: DataTypes.STRING,
  allowNull: true,
},


totalAmount: {
  type: DataTypes.DECIMAL(10,2),
  allowNull: true,
},

    bookingStatus: {
      type: DataTypes.ENUM("Pending", "Confirmed", "Cancelled"),
      defaultValue: "Pending",
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
  },
  {
    tableName: "BookingRails",
    timestamps: true,
  }
);

// Relationships
BookingRail.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Client.hasMany(BookingRail, { foreignKey: "clientId", as: "railBookings" });

BookingRail.hasMany(Passenger, { foreignKey: "bookingId", as: "railPassengers" });
Passenger.belongsTo(BookingRail, { foreignKey: "bookingId", as: "railBooking" });

BookingRail.belongsTo(User, { foreignKey: "bookedBy", as: "bookedByUser" });
BookingRail.belongsTo(Company, { foreignKey: "companyId", as: "company" });

module.exports = BookingRail;
