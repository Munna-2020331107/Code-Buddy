const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 message:
 *                   type: string
 *                   example: Login successful
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, premium: user.premium },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token, message: "Login successful" , userId: user._id, userName: user.name, premium: user.premium, premium_type: user.premium_type, premium_expiry_date: user.premium_expiry_date});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (email) user.email = email;

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/auth/premium:
 *   post:
 *     summary: Update premium subscription
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - premium_type
 *             properties:
 *               premium_type:
 *                 type: string
 *                 enum: [monthly, yearly, quarterly]
 *     responses:
 *       200:
 *         description: Premium subscription updated successfully
 *       400:
 *         description: Invalid subscription type
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.post("/premium", auth, async (req, res) => {
  try {
    const { premium_type } = req.body;
    const user = await User.findById(req.user.id);

    if (!["monthly", "yearly", "quarterly"].includes(premium_type)) {
      return res.status(400).json({ message: "Invalid subscription type" });
    }

    // Calculate expiry date based on subscription type
    const expiryDate = new Date();
    switch (premium_type) {
      case "monthly":
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        break;
      case "quarterly":
        expiryDate.setMonth(expiryDate.getMonth() + 3);
        break;
      case "yearly":
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        break;
    }

    user.premium = true;
    user.premium_type = premium_type;
    user.premium_expiry_date = expiryDate;

    await user.save();
    res.json({ 
      message: "Premium subscription updated successfully",
      expiryDate: user.premium_expiry_date
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/auth/premium/cancel:
 *   post:
 *     summary: Cancel premium subscription
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Premium subscription cancelled successfully
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.post("/premium/cancel", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.premium = false;
    user.premium_type = "none";
    user.premium_expiry_date = null;

    await user.save();
    res.json({ message: "Premium subscription cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/auth/profile/picture:
 *   put:
 *     summary: Update profile picture
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - picture_url
 *             properties:
 *               picture_url:
 *                 type: string
 *                 description: URL of the profile picture
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.put("/profile/picture", auth, async (req, res) => {
  try {
    const { picture_url } = req.body;
    const user = await User.findById(req.user.id);

    user.picture_url = picture_url;
    await user.save();

    res.json({ message: "Profile picture updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
