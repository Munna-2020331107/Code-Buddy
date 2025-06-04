const User = require("../models/User");

/**
 * Middleware to check if user has premium access
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const premium = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // Check if user has premium access
    if (!user.premium) {
      return res.status(403).json({ 
        message: "Premium subscription required",
        required: true
      });
    }

    // Check if premium subscription has expired
    if (user.premium_expiry_date && user.premium_expiry_date < new Date()) {
      user.premium = false;
      user.premium_type = "none";
      user.premium_expiry_date = null;
      await user.save();

      return res.status(403).json({ 
        message: "Premium subscription has expired",
        expired: true
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = premium; 