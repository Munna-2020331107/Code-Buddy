const jwt = require("jsonwebtoken");

/**
 * Middleware to verify JWT token and attach user data to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No authentication token, access denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is expired
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ message: "Token has expired" });
    }

    // Attach user data to request
    req.user = {
      id: decoded.id,
      premium: decoded.premium
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = auth; 