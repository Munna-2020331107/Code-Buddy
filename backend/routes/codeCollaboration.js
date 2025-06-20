const express = require("express");
const router = express.Router();
const CodeCollaboration = require("../models/CodeCollaboration");
const auth = require("../middleware/auth");
const crypto = require("crypto");
const User = require("../models/User");

/**
 * @swagger
 * /api/code-collaboration:
 *   post:
 *     summary: Create a new code collaboration
 *     tags: [Code Collaboration]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      code,
      language,
      shareSettings
    } = req.body;

    // Generate passwords if needed
    if (shareSettings?.viewPassword) {
      shareSettings.viewPassword = crypto.createHash('sha256').update(shareSettings.viewPassword).digest('hex');
    }
    if (shareSettings?.editPassword) {
      shareSettings.editPassword = crypto.createHash('sha256').update(shareSettings.editPassword).digest('hex');
    }

    // Create collaboration with programmingLanguage field
    const collaboration = new CodeCollaboration({
      title,
      description,
      code,
      programmingLanguage: language || "javascript", // Map language to programmingLanguage
      owner: req.user.id,
      shareSettings,
      collaborators: [{
        user: req.user.id,
        role: 'editor'
      }]
    });

    await collaboration.save();
    res.status(201).json(collaboration);
  } catch (error) {
    console.error("Error creating collaboration:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/code-collaboration:
 *   get:
 *     summary: Get all code collaborations for the user
 *     tags: [Code Collaboration]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", auth, async (req, res) => {
  try {
    const collaborations = await CodeCollaboration.find({
      $or: [
        { owner: req.user.id },
        { 'collaborators.user': req.user.id },
        { 'shareSettings.isPublic': true }
      ]
    })
    .populate('owner', 'name email')
    .populate('collaborators.user', 'name email')
    .sort({ updatedAt: -1 });

    res.json(collaborations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/code-collaboration/{id}:
 *   get:
 *     summary: Get a specific code collaboration
 *     tags: [Code Collaboration]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const collaboration = await CodeCollaboration.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.id },
        { 'collaborators.user': req.user.id },
        { 'shareSettings.isPublic': true }
      ]
    })
    .populate('owner', 'name email')
    .populate('collaborators.user', 'name email')
    .populate('activeUsers.user', 'name email');

    if (!collaboration) {
      return res.status(404).json({ message: "Collaboration not found" });
    }

    res.json(collaboration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/code-collaboration/{id}:
 *   put:
 *     summary: Update a code collaboration
 *     tags: [Code Collaboration]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const collaboration = await CodeCollaboration.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!collaboration) {
      return res.status(404).json({ message: "Collaboration not found" });
    }

    const updateFields = [
      "title",
      "description",
      "language",
      "shareSettings"
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'shareSettings') {
          // Handle password hashing
          if (req.body[field].viewPassword) {
            req.body[field].viewPassword = crypto.createHash('sha256')
              .update(req.body[field].viewPassword)
              .digest('hex');
          }
          if (req.body[field].editPassword) {
            req.body[field].editPassword = crypto.createHash('sha256')
              .update(req.body[field].editPassword)
              .digest('hex');
          }
        }
        collaboration[field] = req.body[field];
      }
    });

    await collaboration.save();
    res.json(collaboration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/code-collaboration/{id}:
 *   delete:
 *     summary: Delete a code collaboration
 *     tags: [Code Collaboration]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const collaboration = await CodeCollaboration.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!collaboration) {
      return res.status(404).json({ message: "Collaboration not found" });
    }

    res.json({ message: "Collaboration deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/code-collaboration/{id}/collaborators:
 *   post:
 *     summary: Add a collaborator to the code collaboration
 *     tags: [Code Collaboration]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/collaborators", auth, async (req, res) => {
  try {
    const { email, role } = req.body;
    console.log("=== Add Collaborator Debug ===");
    console.log("1. Request Data:", {
      email,
      role,
      workspaceId: req.params.id,
      ownerId: req.user.id,
      timestamp: new Date().toISOString()
    });

    // First find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log("2. User not found:", { email });
      return res.status(404).json({ message: "User not found" });
    }

    console.log("2. Found User:", {
      userId: user._id,
      email: user.email,
      name: user.name
    });

    const collaboration = await CodeCollaboration.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!collaboration) {
      console.log("3. Collaboration not found:", {
        workspaceId: req.params.id,
        ownerId: req.user.id
      });
      return res.status(404).json({ message: "Collaboration not found" });
    }

    console.log("3. Found Collaboration:", {
      workspaceId: collaboration._id,
      title: collaboration.title,
      totalCollaborators: collaboration.collaborators.length
    });

    // Check if user is already a collaborator
    const existingCollaborator = collaboration.collaborators.find(
      c => c.user && c.user.toString() === user._id.toString()
    );

    if (existingCollaborator) {
      console.log("4. User already collaborator:", {
        userId: user._id,
        currentRole: existingCollaborator.role
      });
      return res.status(400).json({ message: "User is already a collaborator" });
    }

    collaboration.collaborators.push({
      user: user._id,
      role: role || 'viewer',
      joinedAt: new Date()
    });

    await collaboration.save();
    
    console.log("4. Added Collaborator:", {
      userId: user._id,
      role: role || 'viewer',
      totalCollaborators: collaboration.collaborators.length
    });

    res.json(collaboration);
  } catch (error) {
    console.error("5. Error adding collaborator:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/code-collaboration/{id}/collaborators/{userId}:
 *   delete:
 *     summary: Remove a collaborator from the code collaboration
 *     tags: [Code Collaboration]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id/collaborators/:userId", auth, async (req, res) => {
  try {
    const collaboration = await CodeCollaboration.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!collaboration) {
      return res.status(404).json({ message: "Collaboration not found" });
    }

    collaboration.collaborators = collaboration.collaborators.filter(
      c => c.user.toString() !== req.params.userId
    );

    await collaboration.save();
    res.json(collaboration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/code-collaboration/{id}/verify-password:
 *   post:
 *     summary: Verify view/edit password for a code collaboration
 *     tags: [Code Collaboration]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/verify-password", auth, async (req, res) => {
  try {
    const { password, type } = req.body;

    const collaboration = await CodeCollaboration.findById(req.params.id)
      .select('+shareSettings.viewPassword +shareSettings.editPassword');

    if (!collaboration) {
      return res.status(404).json({ message: "Collaboration not found" });
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const isPasswordValid = type === 'view' 
      ? collaboration.shareSettings.viewPassword === hashedPassword
      : collaboration.shareSettings.editPassword === hashedPassword;

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.json({ message: "Password verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 