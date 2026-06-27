const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  place: { type: String, required: true },
  age: { type: Number, required: true },
  education: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  termsAccepted: { type: Boolean, required: true, default: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  blocked: { type: Boolean, default: false },
  rentals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rental" }]
}, { timestamps: true });

// ✅ FIXED: Proper model export
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
