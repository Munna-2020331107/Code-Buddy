const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Get pricing plans
router.get("/plans", async (req, res) => {
  try {
    const plans = [
      {
        id: "monthly",
        name: "Monthly Plan",
        price: 9.99,
        features: [
          "Unlimited Code Collaboration",
          "Advanced Code Analysis",
          "Priority Support",
          "Custom Learning Schedules"
        ],
        duration: "month"
      },
      {
        id: "quarterly",
        name: "Quarterly Plan",
        price: 24.99,
        features: [
          "All Monthly Features",
          "Team Collaboration",
          "Code Templates",
          "API Access"
        ],
        duration: "quarter",
        savings: "Save 17%"
      },
      {
        id: "yearly",
        name: "Yearly Plan",
        price: 89.99,
        features: [
          "All Quarterly Features",
          "Custom Integrations",
          "Dedicated Support",
          "Advanced Analytics"
        ],
        duration: "year",
        savings: "Save 25%"
      }
    ];
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pricing plans" });
  }
});

// Process payment and update user subscription
router.post("/subscribe", async (req, res) => {
  try {
    const { planId, paymentId } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate expiry date based on plan
    const expiryDate = new Date();
    switch (planId) {
      case "monthly":
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        break;
      case "quarterly":
        expiryDate.setMonth(expiryDate.getMonth() + 3);
        break;
      case "yearly":
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        break;
      default:
        return res.status(400).json({ message: "Invalid plan" });
    }

    // Update user subscription
    user.premium = true;
    user.premium_type = planId;
    user.premium_expiry_date = expiryDate;
    await user.save();

    res.json({
      message: "Subscription successful",
      subscription: {
        type: planId,
        expiryDate: expiryDate
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error processing subscription" });
  }
});

module.exports = router; 