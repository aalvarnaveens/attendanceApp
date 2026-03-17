const Attendance = require("../models/attendanceModel");
const Register = require("../models/registerModel");

// Helper: get today's date (midnight, no time component)
const getTodayDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Helper: get current time as HH:MM:SS string
const getCurrentTime = () => {
  return new Date().toLocaleTimeString("en-IN", { hour12: false });
};

// ─── POST /attendance/checkin ────────────────────────────────────────────────
// Mark employee as Present with check-in time
exports.checkIn = async (req, res) => {
  try {
    const { employeeId, employeeName } = req.body;

    if (!employeeId || !employeeName) {
      return res
        .status(400)
        .json({ success: false, message: "employeeId and employeeName are required" });
    }

    const today = getTodayDate();

    // Check if employee already checked in today
    const existing = await Attendance.findOne({ employeeId, date: today });

    if (existing && existing.status === "Present") {
      return res
        .status(400)
        .json({ success: false, message: "Employee has already checked in today" });
    }

    if (existing && existing.status === "Leave") {
      return res
        .status(400)
        .json({ success: false, message: "Employee is on leave today" });
    }

    // If an Absent record already exists for today, update it to Present
    if (existing && existing.status === "Absent") {
      existing.status = "Present";
      existing.checkInTime = getCurrentTime();
      existing.reason = null;
      await existing.save();

      return res.status(200).json({
        success: true,
        message: "Check-in successful (updated from Absent)",
        data: existing,
      });
    }

    // Create new attendance record
    const attendance = await Attendance.create({
      employeeId,
      employeeName,
      date: today,
      status: "Present",
      checkInTime: getCurrentTime(),
    });

    res.status(201).json({
      success: true,
      message: "Check-in successful",
      data: attendance,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /attendance/checkout ───────────────────────────────────────────────
// Update check-out time for employee
exports.checkOut = async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res
        .status(400)
        .json({ success: false, message: "employeeId is required" });
    }

    const today = getTodayDate();

    const attendance = await Attendance.findOne({
      employeeId,
      date: today,
      status: "Present",
    });

    if (!attendance) {
      return res
        .status(404)
        .json({ success: false, message: "No active check-in found for today" });
    }

    if (attendance.checkOutTime) {
      return res
        .status(400)
        .json({ success: false, message: "Employee has already checked out today" });
    }

    attendance.checkOutTime = getCurrentTime();
    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Check-out successful",
      data: attendance,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /attendance/leave ──────────────────────────────────────────────────
// Apply leave with reason
exports.applyLeave = async (req, res) => {
  try {
    const { employeeId, employeeName, date, reason } = req.body;

    if (!employeeId || !employeeName) {
      return res
        .status(400)
        .json({ success: false, message: "employeeId and employeeName are required" });
    }

    if (!reason) {
      return res
        .status(400)
        .json({ success: false, message: "reason is required for leave" });
    }

    // Allow applying leave for a specific date, default to today
    const leaveDate = date ? new Date(new Date(date).setHours(0, 0, 0, 0)) : getTodayDate();

    // Check if a record already exists for this date
    const existing = await Attendance.findOne({ employeeId, date: leaveDate });

    if (existing) {
      if (existing.status === "Present") {
        return res.status(400).json({
          success: false,
          message: "Employee has already checked in for this date, cannot apply leave",
        });
      }

      // Update existing record (e.g., Absent → Leave)
      existing.status = "Leave";
      existing.reason = reason;
      existing.checkInTime = null;
      existing.checkOutTime = null;
      await existing.save();

      return res.status(200).json({
        success: true,
        message: "Leave applied successfully (updated existing record)",
        data: existing,
      });
    }

    const attendance = await Attendance.create({
      employeeId,
      employeeName,
      date: leaveDate,
      status: "Leave",
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Leave applied successfully",
      data: attendance,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /attendance ─────────────────────────────────────────────────────────
// Get all attendance records
exports.getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /attendance/:status ─────────────────────────────────────────────────
// Filter attendance by status (Present, Absent, Leave)
exports.getAttendanceByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ["Present", "Absent", "Leave"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const records = await Attendance.find({ status }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Auto-mark Absent ────────────────────────────────────────────────────────
// Call this at end of day (via cron or manually) to mark employees as Absent
// who did not check in or apply leave for today.
exports.markAbsentees = async (req, res) => {
  try {
    const today = getTodayDate();

    // Get all registered employees
    const employees = await Register.find();

    let markedCount = 0;

    for (const employee of employees) {
      // Check if attendance record exists for today
      const existing = await Attendance.findOne({
        employeeId: employee.employeeId,
        date: today,
      });

      // If no record exists, mark as Absent
      if (!existing) {
        await Attendance.create({
          employeeId: employee.employeeId,
          employeeName: employee.name,
          date: today,
          status: "Absent",
        });
        markedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `${markedCount} employee(s) marked as Absent`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};