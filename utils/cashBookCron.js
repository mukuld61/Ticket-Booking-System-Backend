const cron = require("node-cron");
const CashBookDailyBalance = require("../models/cashBookDailyBalanceModel");

cron.schedule("59 23 * * *", async () => {
  const today = new Date().toISOString().slice(0, 10);

  const todayBalance = await CashBookDailyBalance.findOne({
    where: { balanceDate: today },
  });

  if (!todayBalance) return;

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 1);
  const nextDay = nextDate.toISOString().slice(0, 10);

  await CashBookDailyBalance.findOrCreate({
    where: { balanceDate: nextDay },
    defaults: {
      openingBalance: todayBalance.closingBalance,
      closingBalance: todayBalance.closingBalance,
    },
  });
});
