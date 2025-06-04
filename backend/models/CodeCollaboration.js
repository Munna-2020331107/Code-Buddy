const mongoose = require("mongoose");

const CodeCollaborationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
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
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    collaborators: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      role: {
        type: String,
        enum: ["viewer", "editor"],
        default: "viewer"
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }],
    shareSettings: {
      isPublic: {
        type: Boolean,
        default: false
      },
      viewPassword: {
        type: String,
        select: false
      },
      editPassword: {
        type: String,
        select: false
      },
      allowAnonymous: {
        type: Boolean,
        default: false
      }
    },
    activeUsers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      socketId: String,
      cursor: {
        line: Number,
        ch: Number
      },
      lastActive: {
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
      editedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    lastEdited: {
      by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      at: {
        type: Date,
        default: Date.now
      }
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add text index for search
CodeCollaborationSchema.index({ 
  title: 'text', 
  description: 'text'
});

// Virtual for active users count
CodeCollaborationSchema.virtual('activeUsersCount').get(function() {
  return this.activeUsers.length;
});

// Virtual for collaborators count
CodeCollaborationSchema.virtual('collaboratorsCount').get(function() {
  return this.collaborators.length;
});

module.exports = mongoose.model("CodeCollaboration", CodeCollaborationSchema);