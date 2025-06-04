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
        title: String,
        description: String,
        duration: Number, // in minutes
        completed: {
          type: Boolean,
          default: false
        }
      }]
    }],
    progress: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LearningSchedule", LearningScheduleSchema); 