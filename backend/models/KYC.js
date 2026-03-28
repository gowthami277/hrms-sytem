const mongoose = require("mongoose");

const KYCSchema = new mongoose.Schema({
    empId: { type: String, required: true },
    aadhaarFile: { type: String },
    panFile: { type: String },
    passportFile: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("KYC", KYCSchema);
