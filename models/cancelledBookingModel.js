// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");
// const BookingUpdate = require("./bookingUpdateModel");

// const CancelledBooking = sequelize.define(
//   "CancelledBooking",
//   {
//     id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//     bookingId: { type: DataTypes.INTEGER, allowNull: false },
//     bookingType: {
//       type: DataTypes.ENUM("flight", "bus", "rail"),
//       allowNull: false,
//     },
//     reason: { type: DataTypes.STRING, allowNull: true },
//     cancelledBy: { type: DataTypes.INTEGER, allowNull: false },
//     refundAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
//   //     status: {               
//   //   type: DataTypes.STRING,
//   //   allowNull: false,
//   // },
//   },

//   {
//     tableName: "CancelledBookings",
//     timestamps: true,
//     createdAt: "cancelledAt",
//     updatedAt: false,
//   }
// );



// module.exports = CancelledBooking;




const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BookingUpdate = require("./bookingUpdateModel");

const CancelledBooking = sequelize.define("CancelledBooking", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  bookingType: {
    type: DataTypes.STRING,   
    allowNull: false
  },

  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },


billNo: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  cancellationCharge: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },

  serviceChargeCancellation: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },


  totalAmount: {
    type: DataTypes.FLOAT, 
    defaultValue: 0
  },

  // totalDeduction: {
  //   type: DataTypes.FLOAT, 
  //   defaultValue: 0
  // },

  // refundableAmount: {
  //   type: DataTypes.FLOAT, 
  //   defaultValue: 0
  // },

  paidAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },

  // refundAmount: {
  //   type: DataTypes.FLOAT, 
  //   defaultValue: 0
  // },

  remainingAmount: {
    type: DataTypes.FLOAT, 
    defaultValue: 0
  },

  cancellationDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  remarks: {
    type: DataTypes.STRING,
    allowNull: true
  },

  cancelledBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  companyId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
},
  {
    timestamps: true,
  }
);



module.exports = CancelledBooking;

