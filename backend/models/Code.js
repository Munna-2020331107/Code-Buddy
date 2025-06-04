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
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true
    },
    language: {
      type: String,
      required: true,
      enum: [
        "javascript",
        "python",
        "java",
        "c++",
        "c#",
        "php",
        "ruby",
        "swift",
        "kotlin",
        "go",
        "rust",
        "typescript",
        "html",
        "css",
        "sql",
        "shell",
        "other"
      ]
    },
    category: {
      type: String,
      required: true,
      enum: [
        "algorithm",
        "data-structure",
        "web-development",
        "mobile-development",
        "game-development",
        "system-programming",
        "database",
        "machine-learning",
        "security",
        "testing",
        "other"
      ]
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      text: {
        type: String,
        required: true
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add text index for search
CodeSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text',
  documentation: 'text'
});

// Virtual for like count
CodeSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
CodeSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

module.exports = mongoose.model("Code", CodeSchema); 