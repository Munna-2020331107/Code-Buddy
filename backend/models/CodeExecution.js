const mongoose = require("mongoose");

const codeExecutionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    sourceCode: {
      type: String,
      required: true,
    },
    input: {
      type: String,
      default: "",
    },
    output: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["success", "error", "processing"],
      default: "processing",
    },
    error: {
      message: {
        type: String,
        default: "",
      },
      type: {
        type: String,
        default: "execution_error",
      },
    },
    executionTime: {
      type: Number,
      default: 0,
    },
    aiAnalysis: {
      errorCause: String,
      suggestions: [String],
      complexity: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CodeExecution", codeExecutionSchema); 