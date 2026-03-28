const mongoose = require("mongoose");

const KycDocSchema = new mongoose.Schema({
  docType:    { type: String, required: true },   // e.g. "PAN Card"
  docNumber:  { type: String, default: "" },
  expiry:     { type: String, default: "" },
  fileName:   { type: String, default: "" },
  uploadedAt: { type: Date,   default: Date.now }
});

const EmployeeSchema = new mongoose.Schema({
  empId:       { type: String, required: true, unique: true },
  name:        { type: String, required: true },
  email:       { type: String, required: true },
  phone:       { type: String },
  designation: { type: String },
  department:  { type: String },
  joiningDate: { type: Date },
  DateOfBirth:  { type: Date },
  gender:      { type: String, enum: ["Male", "Female", "Other"] }, 
  address:     { type: String },
  salary:      { type: Number, default: 0 },
  kycStatus:   { type: String, enum: ["Pending", "Complete"], default: "Pending" },
  kycDocs:     { type: [KycDocSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model("Employee", EmployeeSchema);