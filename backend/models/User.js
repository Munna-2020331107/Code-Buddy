const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    premium: { type: Boolean, default: false },
    premium_type: { 
      type: String, 
      enum: ["monthly", "yearly", "quarterly", "none"], 
      default: "none"
    },
    premium_expiry_date: { 
      type: Date,
      default: null
    },
    picture_url: { type: String, default: "" }, // Stores URL of profile picture
    transaction_id: { type: String, default: null },
    pending_plan_id: { type: String, default: null }
  },
  { timestamps: true } // Automatically creates createdAt & updatedAt
);

module.exports = mongoose.model("User", UserSchema);
