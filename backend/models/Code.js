const mongoose = require("mongoose");

const CodeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    language: {
      type: String,
      required: true
    },
    tags: [{
      type: String
    }],
    isPublic: {
      type: Boolean,
      default: false
    },
    executionCount: {
      type: Number,
      default: 0
    },
    lastExecuted: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Code", CodeSchema); 