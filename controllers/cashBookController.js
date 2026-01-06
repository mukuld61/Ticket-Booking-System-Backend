const CashBook = require("../models/cashBookModel");
const CashBookDailyBalance = require("../models/cashBookDailyBalanceModel");
const ensureTodayBalance = require("../utils/cashBookHelper");
const { Op } = require("sequelize");
const User = require("../models/userModel");
const authenticate = require("../middleware/authMiddleware");
// exports.addManualCredit = async (req, res) => {
//   const t = await CashBook.sequelize.transaction();
//   try {
//     const { amount, purpose, remark, paymentMode } = req.body;

//     if (!amount || Number(amount) <= 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Valid amount is required" });
//     }

//     await CashBook.create(
//       {
//         entryType: "credit",
//         amount: Number(amount),
//         purpose: purpose || "Manual Credit",
//         remark: remark || null,
//         paymentMode: paymentMode || "cash",
//         transactionDate: new Date(),
//         createdBy: req.user?.id ?? null,
//       },
//       { transaction: t }
//     );

//     const dailyBalance = await ensureTodayBalance(t);

//     dailyBalance.closingBalance =
//       Number(dailyBalance.closingBalance) + Number(amount);

//     await dailyBalance.save({ transaction: t });

//     await t.commit();

//     return res.status(201).json({
//       success: true,
//       message: "Manual credit entry added successfully",
//       closingBalance: dailyBalance.closingBalance,
//     });
//   } catch (err) {
//     await t.rollback();
//     console.error("addManualCredit error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: err.message,
//     });
//   }
// };


exports.addManualCredit = async (req, res) => {
  const t = await CashBook.sequelize.transaction();
  try {
    const { amount, purpose, remark, paymentMode } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    await CashBook.create(
      {
        entryType: "credit",
        amount: Number(amount),
        purpose: purpose || "Manual Credit",
        remark: remark || null,
        paymentMode: paymentMode || "cash",
        transactionDate: new Date(),
        createdBy: req.user?.id ?? null,
      },
      { transaction: t }
    );

    const dailyBalance = await ensureTodayBalance(t);
    dailyBalance.closingBalance =
      Number(dailyBalance.closingBalance) + Number(amount);

    await dailyBalance.save({ transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: "Credit added",
      closingBalance: dailyBalance.closingBalance,
    });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ success: false, error: err.message });
  }
};

// exports.addDebitEntry = async (req, res) => {
//   const t = await CashBook.sequelize.transaction();
//   try {
//     const { amount, purpose, remark } = req.body;

//     if (!amount || amount <= 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid amount" });
//     }

//     const dailyBalance = await ensureTodayBalance(t);

//     if (Number(dailyBalance.closingBalance) < Number(amount)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Insufficient cash balance" });
//     }
// await CashBook.create(
//   {
//     entryType: "debit",
//     amount: Number(amount),
//     purpose: purpose || "Manual Debit",
//     remark: remark || null,
//     paymentMode: "cash",
//     transactionDate: new Date(),
//     createdBy: req.user?.id ?? null,
//   },
//   { transaction: t }
// );
//     dailyBalance.closingBalance =
//       Number(dailyBalance.closingBalance) - Number(amount);

//     await dailyBalance.save({ transaction: t });

//     await t.commit();

//     res.json({ success: true, message: "Debit entry added" });
//   } catch (err) {
//     await t.rollback();
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

exports.addDebitEntry = async (req, res) => {
  const t = await CashBook.sequelize.transaction();
  try {
    const { amount, purpose, remark } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const dailyBalance = await ensureTodayBalance(t);

    if (Number(dailyBalance.closingBalance) < Number(amount)) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });
    }

    await CashBook.create(
      {
        entryType: "debit",
        amount: Number(amount),
        purpose: purpose || "Manual Debit",
        remark: remark || null,
        paymentMode: "cash",
        transactionDate: new Date(),
        createdBy: req.user?.id ?? null,
      },
      { transaction: t }
    );

    dailyBalance.closingBalance =
      Number(dailyBalance.closingBalance) - Number(amount);

    await dailyBalance.save({ transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: "Debit added",
      closingBalance: dailyBalance.closingBalance,
    });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ success: false, error: err.message });
  }
};






// exports.getCashBook = async (req, res) => {
//   const t = await CashBook.sequelize.transaction();
//   try {
//     const balance = await ensureTodayBalance(t);

//     const entries = await CashBook.findAll({
//       order: [["transactionDate", "DESC"]],
//       transaction: t,
//     });

//     await t.commit();

//     res.json({
//       success: true,
//       openingBalance: balance.openingBalance,
//       closingBalance: balance.closingBalance,
//       entries,
//     });
//   } catch (err) {
//     await t.rollback();
//     res.status(500).json({ success: false, error: err.message });
//   }
// };


exports.getCashBook = async (req, res) => {
  const t = await CashBook.sequelize.transaction();
  try {
 
    if (!req.user || !req.user.id) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { role, id: userId } = req.user;
    const isAgent = role?.toLowerCase() === "agent";

    let entries = [];
    let balance = null;


    if (!isAgent) {
      balance = await ensureTodayBalance(t);

      entries = await CashBook.findAll({
        order: [["transactionDate", "DESC"]],
        transaction: t,
      });
    }

  
    if (isAgent) {
      entries = await CashBook.findAll({
        where: { createdBy: userId },
        order: [["transactionDate", "DESC"]],
        transaction: t,
      });
    }

    await t.commit();

    return res.json({
      success: true,
      openingBalance: isAgent ? null : balance.openingBalance,
      closingBalance: isAgent ? null : balance.closingBalance,
      entries,
    });

  } catch (err) {
    await t.rollback();
    console.error("getCashBook error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};



// exports.getDebitEntries = async (req, res) => {
//   try {
//     const { fromDate, toDate, page = 1, limit = 50 } = req.query;

//     const where = {
//       entryType: "debit",
//     };

//     if (fromDate || toDate) {
//       where.transactionDate = {};
//       if (fromDate) where.transactionDate[Op.gte] = new Date(fromDate);
//       if (toDate) where.transactionDate[Op.lte] = new Date(toDate);
//     }

//     const offset = (page - 1) * limit;

//     const { rows, count } = await CashBook.findAndCountAll({
//       where,
//       order: [["transactionDate", "DESC"]],
//       limit: Number(limit),
//       offset: Number(offset),
//     });

//     const totalDebit = await CashBook.sum("amount", {
//       where,
//     });

//     return res.status(200).json({
//       success: true,
//       totalRecords: count,
//       totalDebitAmount: Number(totalDebit || 0),
//       currentPage: Number(page),
//       totalPages: Math.ceil(count / limit),
//       debits: rows,
//     });
//   } catch (err) {
//     console.error("getDebitEntries error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch debit entries",
//       error: err.message,
//     });
//   }
// };

exports.getDebitEntries = async (req, res) => {
  try {
    const { fromDate, toDate, page = 1, limit = 50 } = req.query;
    const { role, id: userId } = req.user;

    const isAgent = role?.toLowerCase() === "agent";

    const where = {
      entryType: "debit",
    };

   
    if (isAgent) {
      where.createdBy = userId;
    }

    if (fromDate || toDate) {
      where.transactionDate = {};
      if (fromDate) where.transactionDate[Op.gte] = new Date(fromDate);
      if (toDate) where.transactionDate[Op.lte] = new Date(toDate);
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await CashBook.findAndCountAll({
      where,
      order: [["transactionDate", "DESC"]],
      limit: Number(limit),
      offset: Number(offset),
    });

    const totalDebit = await CashBook.sum("amount", {
      where,
    });

    return res.status(200).json({
      success: true,
      totalRecords: count,
      totalDebitAmount: Number(totalDebit || 0),
      currentPage: Number(page),
      totalPages: Math.ceil(count / limit),
      debits: rows,
    });
  } catch (err) {
    console.error("getDebitEntries error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch debit entries",
      error: err.message,
    });
  }
};
