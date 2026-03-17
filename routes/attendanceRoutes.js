const express = require("express");
const router = express.Router();

const {
    checkIn,
    checkOut,
    applyLeave,
    getAllAttendance,
    getAttendanceByStatus,
    markAbsentees,
} = require("../controllers/attendanceController");

// POST routes
router.post("/checkin", checkIn);
router.post("/checkout", checkOut);
router.post("/leave", applyLeave);

// GET routes
router.get("/", getAllAttendance);
router.get("/:status", getAttendanceByStatus);

// Utility route – mark absent employees (call via cron or manually)
router.post("/mark-absent", markAbsentees);

module.exports = router;