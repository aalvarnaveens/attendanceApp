const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true
    },

    employeeName: {
      type: String,
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "Leave"],
      default: "Present"
    },

    checkInTime: {
      type: String
    },

    checkOutTime: {
      type: String
    },

    reason: {
      type: String
    },

    location: {
      latitude: Number,
      longitude: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);