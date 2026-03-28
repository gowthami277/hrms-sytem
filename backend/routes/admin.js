const express    = require("express");
const Employee   = require("../models/Employee");
const Payslip    = require("../models/Payslip");
const Attendance = require("../models/Attendance");
const User       = require("../models/User");
const bcrypt     = require("bcryptjs");
const multer     = require("multer");
const path       = require("path");
const fs         = require("fs");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ── File Upload Setup ─────────────────────────────────────────
const uploadDir = path.join(__dirname, "../../uploads/kyc");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only PDF, JPG, PNG files allowed"));
  }
});

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
    const employee = new Employee({ empId, name, email, phone, designation, department, joiningDate, salary });
    await employee.save();

    const emailPrefix    = email.split("@")[0];
    const defaultPassword = emailPrefix + "@123";
    const hashedPassword  = await bcrypt.hash(defaultPassword, 10);
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
      { empId: req.params.empId }, req.body, { new: true }
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

// Stats
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

// ── KYC ──────────────────────────────────────────────────────

// Upload KYC document for an employee
router.post("/employees/:empId/kyc", authMiddleware("admin"), upload.single("kycFile"), async (req, res) => {
  try {
    const { docType, docNumber, expiry } = req.body;
    if (!docType) return res.status(400).json({ error: "Document type required" });

    const employee = await Employee.findOne({ empId: req.params.empId });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // PAN format validation
    if (docType === "PAN Card") {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (docNumber && !panRegex.test(docNumber.toUpperCase())) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "Invalid PAN format. Expected: ABCDE1234F" });
      }
    }

    // Remove existing doc of same type
    employee.kycDocs = employee.kycDocs.filter(d => d.docType !== docType);

    // Add new doc
    employee.kycDocs.push({
      docType,
      docNumber: docNumber || "",
      expiry:    expiry || "",
      fileName:  req.file ? req.file.filename : "",
      uploadedAt: new Date()
    });

    // Auto-complete if 2+ docs uploaded
    if (employee.kycDocs.length >= 2) employee.kycStatus = "Complete";

    await employee.save();
    res.json({ message: "KYC document uploaded!", kycStatus: employee.kycStatus, kycDocs: employee.kycDocs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get KYC docs for an employee
router.get("/employees/:empId/kyc", authMiddleware("admin"), async (req, res) => {
  try {
    const employee = await Employee.findOne({ empId: req.params.empId });
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json({ kycStatus: employee.kycStatus, kycDocs: employee.kycDocs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View/Download KYC file
router.get("/kyc/file/:filename", authMiddleware("admin"), (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });
  const disposition = req.query.download === "1" ? "attachment" : "inline";
  res.setHeader("Content-Disposition", `${disposition}; filename="${req.params.filename}"`);
  res.sendFile(filePath);
});

// ── Payslips ──────────────────────────────────────────────────

router.post("/payslips", authMiddleware("admin"), async (req, res) => {
  try {
    const payslip = new Payslip(req.body);
    await payslip.save();
    res.json({ message: "Payslip uploaded successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/payslips", authMiddleware("admin"), async (req, res) => {
  try {
    const payslips = await Payslip.find().sort({ createdAt: -1 });
    res.json(payslips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/payslips/:id", authMiddleware("admin"), async (req, res) => {
  try {
    await Payslip.findByIdAndDelete(req.params.id);
    res.json({ message: "Payslip deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Attendance ────────────────────────────────────────────────

router.post("/attendance", authMiddleware("admin"), async (req, res) => {
  try {
    const record = new Attendance(req.body);
    await record.save();
    res.json({ message: "Attendance marked!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/attendance/:empId", authMiddleware("admin"), async (req, res) => {
  try {
    const records = await Attendance.find({ empId: req.params.empId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;