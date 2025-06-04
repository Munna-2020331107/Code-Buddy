const express = require("express");
const router = express.Router();
const LearningSchedule = require("../models/LearningSchedule");
const { generateLearningSchedule } = require("../middleware/gpt");
const auth = require("../middleware/auth");
const premium = require("../middleware/premium");

/**
 * @swagger
 * /api/learning-schedule:
 *   post:
 *     summary: Create a new learning schedule
 *     tags: [Learning Schedule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *               - days
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Learning goals and requirements
 *               days:
 *                 type: number
 *                 description: Number of days for the schedule
 */
router.post("/", auth, premium, async (req, res) => {
  try {
    const { prompt, days } = req.body;

    // Generate schedule using GPT
    const generatedSchedule = await generateLearningSchedule(prompt, days);

    // Create new schedule
    const schedule = new LearningSchedule({
      user: req.user.id,
      prompt,
      ...generatedSchedule,
      startDate: new Date(),
      endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    });

    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/learning-schedule:
 *   get:
 *     summary: Get all learning schedules for the user
 *     tags: [Learning Schedule]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", auth, async (req, res) => {
  try {
    const schedules = await LearningSchedule.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/learning-schedule/{id}:
 *   get:
 *     summary: Get a specific learning schedule
 *     tags: [Learning Schedule]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const schedule = await LearningSchedule.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/learning-schedule/{id}/task/{taskId}:
 *   put:
 *     summary: Update task completion status
 *     tags: [Learning Schedule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completed:
 *                 type: boolean
 *               notes:
 *                 type: string
 */
router.put("/:id/task/:taskId", auth, async (req, res) => {
  try {
    const { completed, notes } = req.body;
    const schedule = await LearningSchedule.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Find and update the task
    let taskFound = false;
    schedule.dailyTasks.forEach(day => {
      day.tasks.forEach(task => {
        if (task._id.toString() === req.params.taskId) {
          task.completed = completed;
          task.completedAt = completed ? new Date() : null;
          if (notes) task.notes = notes;
          taskFound = true;
        }
      });
    });

    if (!taskFound) {
      return res.status(404).json({ message: "Task not found" });
    }

    await schedule.save();
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/learning-schedule/{id}/status:
 *   put:
 *     summary: Update schedule status
 *     tags: [Learning Schedule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, completed, paused]
 */
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const schedule = await LearningSchedule.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    schedule.status = status;
    schedule.lastUpdated = new Date();
    await schedule.save();

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/learning-schedule/{id}:
 *   delete:
 *     summary: Delete a learning schedule
 *     tags: [Learning Schedule]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const schedule = await LearningSchedule.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 