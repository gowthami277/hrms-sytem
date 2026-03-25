require("dotenv").config({ path: __dirname + "/../.env" });
const express    = require("express");
const cors       = require("cors");
const path       = require("path");
const connectDB  = require("./config/db");

const authRoutes     = require("./routes/auth");
const adminRoutes    = require("./routes/admin");
const employeeRoutes = require("./routes/employee");

const app = express();

// Connect DB then seed
connectDB().then(() => seedDefaultAdmin());

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth",     authRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/employee", employeeRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "../frontend/login.html"));
  }
});

// ── Seed default admin & demo employee ──────────────────────
async function seedDefaultAdmin() {
  try {
    const bcrypt   = require("bcrypt");
    const User     = require("./models/User");
    const Employee = require("./models/Employee");

    // ── Admin ──
    const adminEmail = "paidigowthami.tt@gmail.com";
    const existing   = await User.findOne({ email: adminEmail });
    if (!existing) {
      const hashed = await bcrypt.hash("Gowthami@123", 10);
      await User.create({
        empId: "ADMIN001", name: "Admin",
        email: adminEmail, password: hashed, role: "admin"
      });
      console.log("✅ Default admin seeded");
    } else {
      console.log("ℹ️  Admin already exists");
    }

    // ── Demo Employee User ──
    const empEmail    = "employee@sankar.com";
    const existingEmp = await User.findOne({ email: empEmail });
    if (!existingEmp) {
      const hashed = await bcrypt.hash("emp123", 10);
      await User.create({
        empId: "EMP001", name: "Demo Employee",
        email: empEmail, password: hashed, role: "employee"
      });
      console.log("✅ Demo employee user seeded");
    } else {
      console.log("ℹ️  Demo employee user already exists");
    }

    // ── Demo Employee Record (separate try — won't crash if duplicate) ──
    try {
      const empExists = await Employee.findOne({ empId: "EMP001" });
      if (!empExists) {
        await Employee.create({
          empId: "EMP001", name: "Demo Employee",
          email: empEmail, designation: "Software Engineer",
          department: "IT", joiningDate: new Date("2024-01-01"), salary: 50000
        });
        console.log("✅ Demo employee record seeded");
      } else {
        console.log("ℹ️  Demo employee record already exists");
      }
    } catch (empErr) {
      console.log("ℹ️  Employee record skipped:", empErr.message);
    }

  } catch (err) {
    console.error("❌ Seed error:", err.message);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📂 Open: http://localhost:${PORT}/login.html`);
});