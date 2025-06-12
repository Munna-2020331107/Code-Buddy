const express = require("express");
const router = express.Router();
const Code = require("../models/Code");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

/**
 * @swagger
 * /api/code:
 *   post:
 *     summary: Create a new code snippet
 *     tags: [Code]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", auth, async (req, res) => {
  try {
    console.log(req.body);
    const {
      title,
      description,
      code,
      programmingLanguage,
      category,
      difficulty,
      tags,
      isPublic,
      dependencies,
      documentation,
      timeComplexity,
      spaceComplexity
    } = req.body;

    // Validate required fields
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Code is required and cannot be empty" 
      });
    }

    const newCode = new Code({
      user: req.user.id,
      title,
      description,
      code: code.trim(),
      programmingLanguage,
      category,
      difficulty: difficulty || "beginner",
      tags: tags || [],
      isPublic: isPublic || false,
      dependencies: dependencies || [],
      documentation,
      timeComplexity,
      spaceComplexity
    });

    await newCode.save();
    res.status(201).json({
      success: true,
      data: newCode
    });
  } catch (error) {
    console.error("Code creation error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      errors: error.errors
    });
  }
});

/**
 * @swagger
 * /api/code:
 *   get:
 *     summary: Get all code snippets with filters
 *     tags: [Code]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", auth, async (req, res) => {
  try {
    const {
      programmingLanguage,
      category,
      difficulty,
      tags,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10
    } = req.query;

    // const query = { isPublic: true };
    const query = {};

    // Add filters
    if (programmingLanguage) query.programmingLanguage = programmingLanguage;
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (tags) query.tags = { $in: tags.split(",") };
    if (search) {
      query.$text = { $search: search };
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const codes = await Code.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Code.countDocuments(query);

    res.json({
      success: true,
      data: {
        codes,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching codes:", error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      errors: error.errors
    });
  }
});

/**
 * @swagger
 * /api/code/{id}:
 *   get:
 *     summary: Get a specific code snippet
 *     tags: [Code]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const code = await Code.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user.id },
        { isPublic: true }
      ]
    })
    .populate("user", "name email")
    .populate("likes", "name")
    .populate("comments.user", "name");

    if (!code) {
      return res.status(404).json({ message: "Code not found" });
    }

    res.json(code);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/code/{id}:
 *   put:
 *     summary: Update a code snippet
 *     tags: [Code]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const code = await Code.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!code) {
      return res.status(404).json({ message: "Code not found" });
    }

    // Save current version
    code.previousVersions.push({
      code: code.code,
      version: code.version
    });

    // Update fields
    const updateFields = [
      "title",
      "description",
      "code",
      "programmingLanguage",
      "category",
      "difficulty",
      "tags",
      "isPublic",
      "dependencies",
      "documentation",
      "timeComplexity",
      "spaceComplexity"
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        code[field] = req.body[field];
      }
    });

    code.version += 1;
    await code.save();

    res.json(code);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/code/{id}:
 *   delete:
 *     summary: Delete a code snippet
 *     tags: [Code]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const code = await Code.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!code) {
      return res.status(404).json({ message: "Code not found" });
    }

    res.json({ message: "Code deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/code/{id}/like:
 *   post:
 *     summary: Like/Unlike a code snippet
 *     tags: [Code]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/like", auth, async (req, res) => {
  try {
    const code = await Code.findById(req.params.id);

    if (!code) {
      return res.status(404).json({ message: "Code not found" });
    }

    const likeIndex = code.likes.indexOf(req.user.id);

    if (likeIndex === -1) {
      code.likes.push(req.user.id);
    } else {
      code.likes.splice(likeIndex, 1);
    }

    await code.save();
    res.json(code);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/code/{id}/comment:
 *   post:
 *     summary: Add a comment to a code snippet
 *     tags: [Code]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { text } = req.body;

    const code = await Code.findById(req.params.id);

    if (!code) {
      return res.status(404).json({ message: "Code not found" });
    }

    code.comments.push({
      user: req.user.id,
      text
    });

    await code.save();
    res.json(code);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/code/{id}/comment/{commentId}:
 *   delete:
 *     summary: Delete a comment from a code snippet
 *     tags: [Code]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id/comment/:commentId", auth, async (req, res) => {
  try {
    const code = await Code.findById(req.params.id);

    if (!code) {
      return res.status(404).json({ message: "Code not found" });
    }

    const comment = code.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the comment owner or code owner
    if (comment.user.toString() !== req.user.id && code.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.remove();
    await code.save();

    res.json(code);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/code/user:
 *   get:
 *     summary: Get all code snippets for the authenticated user
 *     tags: [Code]
 *     security:
 *       - bearerAuth: []
 */
router.get("/user", auth, async (req, res) => {
  console.log(req.user);
  try {
    console.log("hello");
    const {
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10
    } = req.query;
    console.log(req.query);

    // Use string user ID directly
    const query = { user: req.user.id };
    console.log(query);

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const codes = await Code.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Code.countDocuments(query);

    res.json({
      success: true,
      data: {
        codes,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching user codes:", error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      errors: error.errors
    });
  }
});

module.exports = router; 