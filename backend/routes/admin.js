const express    = require("express");
const Employee   = require("../models/Employee");
const Payslip    = require("../models/Payslip");
const Attendance = require("../models/Attendance");
const User       = require("../models/User");
const bcrypt     = require("bcryptjs");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ── Employee CRUD ─────────────────────────────────────────────

// Get all employees
router.get("/employees", authMiddleware("admin"), async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new employee (also creates a User account)
router.post("/employees", authMiddleware("admin"), async (req, res) => {
  try {
    const { empId, name, email, phone, designation, department, joiningDate, salary } = req.body;

    // Create Employee record
    const employee = new Employee({ empId, name, email, phone, designation, department, joiningDate, salary });
    await employee.save();

    // Auto-create login account: password = email prefix + @123
    const emailPrefix = email.split("@")[0];
    const defaultPassword = emailPrefix + "@123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const user = new User({ empId, name, email, password: hashedPassword, role: "employee" });
    await user.save();

    res.json({ message: "Employee added successfully!", defaultPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update employee
router.put("/employees/:empId", authMiddleware("admin"), async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { empId: req.params.empId },
      req.body,
      { new: true }
    );
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json({ message: "Employee updated", employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete employee
router.delete("/employees/:empId", authMiddleware("admin"), async (req, res) => {
  try {
    await Employee.findOneAndDelete({ empId: req.params.empId });
    await User.findOneAndDelete({ empId: req.params.empId });
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Employee stats for dashboard
router.get("/stats", authMiddleware("admin"), async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const kycPending     = await Employee.countDocuments({ kycStatus: "Pending" });
    const kycComplete    = await Employee.countDocuments({ kycStatus: "Complete" });
    res.json({ totalEmployees, kycPending, kycComplete });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Payslips ──────────────────────────────────────────────────

// Upload payslip
router.post("/payslips", authMiddleware("admin"), async (req, res) => {
  try {
    const payslip = new Payslip(req.body);
    await payslip.save();
    res.json({ message: "Payslip uploaded successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all payslips
router.get("/payslips", authMiddleware("admin"), async (req, res) => {
  try {
    const payslips = await Payslip.find().sort({ createdAt: -1 });
    res.json(payslips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete payslip
router.delete("/payslips/:id", authMiddleware("admin"), async (req, res) => {
  try {
    await Payslip.findByIdAndDelete(req.params.id);
    res.json({ message: "Payslip deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Attendance ────────────────────────────────────────────────

// Mark attendance
router.post("/attendance", authMiddleware("admin"), async (req, res) => {
  try {
    const record = new Attendance(req.body);
    await record.save();
    res.json({ message: "Attendance marked!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance for specific employee
router.get("/attendance/:empId", authMiddleware("admin"), async (req, res) => {
  try {
    const records = await Attendance.find({ empId: req.params.empId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
