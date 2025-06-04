const mongoose = require("mongoose");

const ImageToCodeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    originalText: {
      type: String
    },
    convertedCode: {
      type: String
    },
    language: {
      type: String
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing"
    },
    error: {
      message: String,
      type: String
    },
    executionResult: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CodeExecution"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ImageToCode", ImageToCodeSchema); 