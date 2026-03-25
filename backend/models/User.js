const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  empId: { type: String, required: true },
  name:  { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:  { type: String, enum: ["admin", "employee"], default: "employee" }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
