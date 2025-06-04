const mongoose = require("mongoose");

const LearningScheduleSchema = new mongoose.Schema(
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
    prompt: {
      type: String,
      required: true
    },
    topics: [{
      type: String,
      required: true
    }],
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    dailyTasks: [{
      date: {
        type: Date,
        required: true
      },
      tasks: [{
        title: {
          type: String,
          required: true
        },
        description: {
          type: String,
          required: true
        },
        duration: {
          type: Number, // in minutes
          required: true
        },
        resources: [{
          type: {
            type: String,
            enum: ["article", "video", "documentation", "other"],
            required: true
          },
          title: {
            type: String,
            required: true
          },
          url: {
            type: String,
            required: true
          },
          description: String
        }],
        completed: {
          type: Boolean,
          default: false
        },
        completedAt: {
          type: Date
        },
        notes: {
          type: String
        }
      }]
    }],
    progress: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["active", "completed", "paused"],
      default: "active"
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Calculate progress before saving
LearningScheduleSchema.pre("save", function(next) {
  if (this.dailyTasks && this.dailyTasks.length > 0) {
    let totalTasks = 0;
    let completedTasks = 0;

    this.dailyTasks.forEach(day => {
      day.tasks.forEach(task => {
        totalTasks++;
        if (task.completed) completedTasks++;
      });
    });

    this.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }
  next();
});

module.exports = mongoose.model("LearningSchedule", LearningScheduleSchema); 