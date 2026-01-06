const { sequelize } = require("../config/db");
const CashBookDailyBalance = require("../models/cashBookDailyBalanceModel");
const { Op } = require("sequelize");  

// const ensureTodayBalance = async (transaction) => {
//   const today = new Date().toISOString().slice(0, 10); 

//   let balance = await CashBookDailyBalance.findOne({
//     where: { balanceDate: today },
//     lock: transaction.LOCK.UPDATE,
//     transaction,
//   });

//   if (!balance) {
    
//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);
//     const yDate = yesterday.toISOString().slice(0, 10);

//     const prevBalance = await CashBookDailyBalance.findOne({
//       where: { balanceDate: yDate },
//     });

//     const openingBalance = prevBalance
//       ? Number(prevBalance.closingBalance)
//       : 0;

//     balance = await CashBookDailyBalance.create(
//       {
//         balanceDate: today,
//         openingBalance,
//         closingBalance: openingBalance,
//       },
//       { transaction }
//     );
//   }

//   return balance;
// };





// const ensureTodayBalance = async (transaction) => {
//   const today = new Date().toISOString().slice(0, 10);


//   let todayBalance = await CashBookDailyBalance.findOne({
//     where: { balanceDate: today },
//     transaction,
//     lock: transaction ? transaction.LOCK.UPDATE : undefined,
//   });

//   if (todayBalance) return todayBalance;


//   const lastBalance = await CashBookDailyBalance.findOne({
//     where: {
//       balanceDate: { [Op.lt]: today },
//     },
//     order: [["balanceDate", "DESC"]],
//     transaction,
//   });

//   const openingBalance = lastBalance
//     ? Number(lastBalance.closingBalance)
//     : 0;

 
//   todayBalance = await CashBookDailyBalance.create(
//     {
//       balanceDate: today,
//       openingBalance,
//       closingBalance: openingBalance,
//     },
//     { transaction }
//   );

//   return todayBalance;
// };

const ensureTodayBalance = async (transaction) => {
  const today = new Date().toISOString().slice(0, 10);


  let todayBalance = await CashBookDailyBalance.findOne({
    where: { balanceDate: today },
    transaction,
    lock: transaction?.LOCK.UPDATE,
  });

  if (todayBalance) return todayBalance;


  const lastBalance = await CashBookDailyBalance.findOne({
    where: { balanceDate: { [Op.lt]: today } },
    order: [["balanceDate", "DESC"]],
    transaction,
  });

  const openingBalance = lastBalance
    ? Number(lastBalance.closingBalance)
    : 0;

  return await CashBookDailyBalance.create(
    {
      balanceDate: today,
      openingBalance,
      closingBalance: openingBalance,
    },
    { transaction }
  );
};

module.exports = ensureTodayBalance;
