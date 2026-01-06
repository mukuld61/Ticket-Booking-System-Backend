const Ledger = require("../models/ledgerModel");
const Client = require("../models/clientModel");
const User = require("../models/userModel");


exports.createLedgerEntry = async (req, res) => {
  try {
    const {
      clientId,
      agentId,
      bookingId,
      bookingType,
      entryType,
      description,
      amount,
      paymentMode,
      createdBy,
    } = req.body;

    if (!clientId || !entryType || !amount) {
      return res
        .status(400)
        .json({ success: false, message: "clientId, entryType, and amount are required" });
    }


    const lastEntry = await Ledger.findOne({
      where: { clientId },
      order: [["transactionDate", "DESC"]],
    });

    let newBalance = 0;
    if (lastEntry) {
      newBalance = parseFloat(lastEntry.balanceAfter);
    }

    if (entryType === "credit") newBalance += parseFloat(amount);
    else if (entryType === "debit") newBalance -= parseFloat(amount);

    const ledgerEntry = await Ledger.create({
      clientId,
      agentId,
      bookingId,
      bookingType,
      entryType,
      description,
      amount,
      balanceAfter: newBalance,
      paymentMode,
      createdBy,
    });

    res.status(201).json({
      success: true,
      message: "Ledger entry created successfully",
      data: ledgerEntry,
    });
  } catch (error) {
    console.error("Ledger Creation Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};


// exports.getLedgerByClient = async (req, res) => {
//   try {
//     const { clientId } = req.params;

//     const entries = await Ledger.findAll({
//       where: { clientId },
//       order: [["transactionDate", "ASC"]],
//       include: [
//         { model: Client, as: "client", attributes: ["name", "email", "phone"] },
//         { model: User, as: "createdByUser", attributes: ["name", "role"] },
//       ],
//     });

//     if (!entries.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No ledger entries found for this client",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       count: entries.length,
//       data: entries,
//     });
//   } catch (error) {
//     console.error("Get Ledger Error:", error);
//     res.status(500).json({ success: false, message: "Server Error", error: error.message });
//   }
// };



// exports.getAllLedger = async (req, res) => {
//   try {
//     const entries = await Ledger.findAll({
//       order: [["transactionDate", "ASC"], ["createdAt", "ASC"]],
//       include: [
//         { model: Client, as: "client", attributes: ["name", "email", "phone"] },
//         { model: User, as: "createdByUser", attributes: ["name", "role"] },
//       ],
//     });

//     if (!entries.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No ledger entries found",
//       });
//     }

//     let running = {}; 

//     const formatted = entries.map(e => {
//       if (!running[e.clientId]) running[e.clientId] = 0;

//       if (e.entryType === "debit") {
//         running[e.clientId] += Number(e.amount);
//       } else {
//         running[e.clientId] -= Number(e.amount);
//       }

//       return {
//         id: e.id,
//         clientId: e.clientId,
//         client: e.client,
//         bookingId: e.bookingId,
//         bookingType: e.bookingType,
//         entryType: e.entryType,
//         description: e.description,
//         amount: Number(e.amount),
//         paymentMode: e.paymentMode,
//         transactionDate: e.transactionDate,
//         createdByUser: e.createdByUser,
//         remainingBalance: parseFloat(running[e.clientId].toFixed(2)) 
//       };
//     });

//     res.status(200).json({
//       success: true,
//       count: formatted.length,
//       data: formatted,
//     });
//   } catch (error) {
//     console.error("Get All Ledger Error:", error);
//     res.status(500).json({ success: false, message: "Server Error", error: error.message });
//   }
// };


exports.getAllLedger = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const isAgent = role?.toLowerCase() === "agent";

    const where = {};

  
    if (isAgent) {
      where.createdBy = userId;
    }

    // const entries = await Ledger.findAll({
    //   where,
    //   order: [["transactionDate", "ASC"], ["createdAt", "ASC"]],
    //   include: [
    //     { model: Client, as: "client", attributes: ["name", "email", "phone"] },
    //     { model: User, as: "createdByUser", attributes: ["name", "role"] },
    //   ],
    // });

    const entries = await Ledger.findAll({
  where,
  distinct: true,
  order: [["transactionDate", "ASC"], ["createdAt", "ASC"]],
  include: [
    {
      model: Client,
      as: "client",
      attributes: ["name", "email", "phone"],
      required: false,
    },
    {
      model: User,
      as: "createdByUser",
      attributes: ["name", "role"],
      required: false,
    },
  ],
});


    if (!entries.length) {
      return res.status(404).json({
        success: false,
        message: "No ledger entries found",
      });
    }

    let running = {};

    const formatted = entries.map(e => {
      if (!running[e.clientId]) running[e.clientId] = 0;

      if (e.entryType === "debit") {
        running[e.clientId] += Number(e.amount);
      } else {
        running[e.clientId] -= Number(e.amount);
      }

      return {
        id: e.id,
        clientId: e.clientId,
        client: e.client,
        bookingId: e.bookingId,
        bookingType: e.bookingType,
        entryType: e.entryType,
        description: e.description,
        amount: Number(e.amount),
        paymentMode: e.paymentMode,
        transactionDate: e.transactionDate,
        createdByUser: e.createdByUser,
        remainingBalance: parseFloat(running[e.clientId].toFixed(2))
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("Get All Ledger Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
