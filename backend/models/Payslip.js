const mongoose = require("mongoose");

const PayslipSchema = new mongoose.Schema({
  empId:       { type: String, required: true },
  month:       { type: String, required: true }, // e.g. "Feb-2026"
  grossSalary: { type: Number, required: true },
  deductions:  { type: Number, default: 0 },
  netSalary:   { type: Number, required: true },
  fileUrl:     { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Payslip", PayslipSchema);
