
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Payment = sequelize.define("Payment", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  clientId: { type: DataTypes.INTEGER, allowNull: false },
  bookingId: { type: DataTypes.INTEGER, allowNull: false },
  bookingType: { type: DataTypes.ENUM("flight", "bus", "rail"), allowNull: false },

  pnrNumber: { type: DataTypes.STRING },
  ticketNumber: { type: DataTypes.STRING },

  totalAmount: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0.00 },
  serviceCharge: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0.00 },
  otherCharge: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0.00 },
  invoiceTotal: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0.00 },

  totalRemainingBalance: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0.00 },

  receivingAmount: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0.00 },
  receivingDate: { type: DataTypes.DATE, allowNull: false },
  note: { type: DataTypes.TEXT },

  invoiceId: { type: DataTypes.INTEGER, allowNull: true },
billNo: { type: DataTypes.STRING(64), allowNull: true },


  paymentType: { type: DataTypes.STRING, allowNull: false },

  bankName: { type: DataTypes.STRING },
  transactionId: { type: DataTypes.STRING },
  transactionDate: { type: DataTypes.DATE },

  cardNumber: { type: DataTypes.STRING },
  cardType: { type: DataTypes.STRING },
  cardHolderName: { type: DataTypes.STRING },
  cardTransactionDate: { type: DataTypes.DATE },

  upiId: { type: DataTypes.STRING },
  upiTransactionId: { type: DataTypes.STRING },
  upiTransactionDate: { type: DataTypes.DATE },

  chequeNumber: { type: DataTypes.STRING },
  chequeBankName: { type: DataTypes.STRING },
  chequeTransactionDate: { type: DataTypes.DATE },

  createdBy: { type: DataTypes.INTEGER },
  companyId: { type: DataTypes.INTEGER }
}, {
  tableName: "payments",
  timestamps: true
});


module.exports = Payment;
