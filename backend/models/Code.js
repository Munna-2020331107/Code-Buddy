const mongoose = require("mongoose");

const CodeSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true
    },
    title: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    code: {
      type: String,
      trim: true
    },
    programmingLanguage: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      trim: true
    },
    difficulty: {
      type: String,
      default: "beginner"
    },
    tags: [{
      type: String,
      trim: true
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
    },
    likes: [{
      type: String
    }],
    comments: [{
      user: {
        type: String
      },
      text: {
        type: String
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    version: {
      type: Number,
      default: 1
    },
    previousVersions: [{
      code: String,
      version: Number,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    dependencies: [{
      name: String,
      version: String
    }],
    documentation: {
      type: String,
      trim: true
    },
    timeComplexity: {
      type: String,
      trim: true
    },
    spaceComplexity: {
      type: String,
      trim: true
    }
  },
  { 
    timestamps: true
  }
);

module.exports = mongoose.model("Code", CodeSchema); 