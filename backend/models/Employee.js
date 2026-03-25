const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  empId:       { type: String, required: true, unique: true },
  name:        { type: String, required: true },
  email:       { type: String, required: true },
  phone:       { type: String },
  designation: { type: String },
  department:  { type: String },
  joiningDate: { type: Date },
  salary:      { type: Number, default: 0 },
  kycStatus:   { type: String, enum: ["Pending", "Complete"], default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("Employee", EmployeeSchema);
