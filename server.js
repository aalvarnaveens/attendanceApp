const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");



const app = express();

app.use(
 cors({
  origin: "https://radiant-fox-081675.netlify.app",
  credentials: true
 })
);
app.use(express.json());
app.use(cookieParser());
const attendanceRoutes = require("./routes/attendanceRoutes");
const registerRoutes = require("./routes/registerRoutes");

app.use("/api", registerRoutes);
app.use("/api/attendance", attendanceRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB `Connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});