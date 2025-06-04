const mongoose = require("mongoose");

const CodeExecutionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    code: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Code",
      required: true
    },
    input: {
      type: String
    },
    output: {
      type: String
    },
    error: {
      message: String,
      stack: String,
      type: String
    },
    executionTime: {
      type: Number // in milliseconds
    },
    status: {
      type: String,
      enum: ["success", "error", "timeout"],
      required: true
    },
    aiAnalysis: {
      errorCause: String,
      suggestions: [String],
      complexity: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CodeExecution", CodeExecutionSchema); 