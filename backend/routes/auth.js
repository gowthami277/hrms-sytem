const express = require("express");
const bcrypt  = require("bcrypt");
const jwt     = require("jsonwebtoken");
const User    = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { empId, name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ empId, name, email, password: hashedPassword, role });
    await user.save();
    res.json({ message: "Employee registered successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Error registering user", details: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, empId: user.empId, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, role: user.role, empId: user.empId, name: user.name });
  } catch (err) {
    res.status(500).json({ error: "Error logging in", details: err.message });
  }
});

// RESET PASSWORD (user enters new password)
router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        res.json({
            message: "Password updated successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
