const express    = require("express");
const Payslip    = require("../models/Payslip");
const Attendance = require("../models/Attendance");
const Employee   = require("../models/Employee");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in employee profile
router.get("/profile", authMiddleware("employee"), async (req, res) => {
  try {
    const employee = await Employee.findOne({ empId: req.user.empId });
    if (!employee) return res.status(404).json({ error: "Profile not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get payslips for logged-in employee
router.get("/payslips", authMiddleware("employee"), async (req, res) => {
  try {
    const payslips = await Payslip.find({ empId: req.user.empId }).sort({ createdAt: -1 });
    res.json(payslips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance for logged-in employee
router.get("/attendance", authMiddleware("employee"), async (req, res) => {
  try {
    const attendance = await Attendance.find({ empId: req.user.empId }).sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
