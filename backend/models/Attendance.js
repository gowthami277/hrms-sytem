const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  empId:  { type: String, required: true },
  date:   { type: Date, required: true },
  status: { type: String, enum: ["Present", "Absent", "Leave"], default: "Present" }
}, { timestamps: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);
