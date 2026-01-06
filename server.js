const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const multer = require("multer");


const sequelize = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");

const clientRoutes = require("./routes/clientRoutes");
const railwayRoutes = require("./routes/railwayBookingRoutes");
const flightRoutes = require("./routes/flightBookingRoutes");
const busRoutes = require("./routes/busBookingRoutes");

const bookingRoutes = require("./routes/bookingRoutes");
const dashboardRoutes= require("./routes/dashboardRoutes")
const bookingUpdateRoutes = require("./routes/bookingUpdateRoutes")
const CancelledBookingRoutes = require("./routes/cancelledBookingRoutes")
const ledgerRoutes = require("./routes/ledgerRoutes");
const companyRoutes = require("./routes/companyRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const paymentsRouter = require("./routes/payments");
const customerStatementRoutes = require("./routes/customerStatementRoutes");
const cashBookRoutes = require("./routes/cashBookRoutes");
const cashBookCron = require("./utils/cashBookCron");
const passengerRoutes = require("./routes/passengerRoutes");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

//Admin Routes=======>>>>>

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/enquiries", enquiryRoutes);

app.use("/api/clients", clientRoutes);
app.use("/api/railway", railwayRoutes);
app.use("/api/flight", flightRoutes);
app.use("/api/bus", busRoutes);

app.use("/api", bookingRoutes);

app.use("/api/dashboard",dashboardRoutes)

app.use("/api/updateBooking",bookingUpdateRoutes)
app.use("/api/cancelBooking",CancelledBookingRoutes)
app.use("/api/ledger", ledgerRoutes); 
app.use("/api/company", companyRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentsRouter);
app.use("/api/customer-statement", customerStatementRoutes);
app.use("/api/cashbook", cashBookRoutes);
app.use("/api/passengers", passengerRoutes);
//End========>>>>>


                   
app.get("/", (req, res) => {
  res.send("API is running successfully!");
});
sequelize
  .sync()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error(" Database connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
