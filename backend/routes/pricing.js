const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const SSLCommerzPayment = require('sslcommerz-lts');

// SSL Commerz configuration
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = false; // true for live, false for sandbox

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

// Initialize SSL Commerz payment
router.post("/init-payment", async (req, res) => {
  try {
    const { planId } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get plan details
    const plan = await getPlanDetails(planId);
    if (!plan) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    // Create SSL Commerz session data
    const tran_id = `CODE_BUDDY_${Date.now()}`;
    const data = {
      total_amount: plan.price,
      currency: 'USD',
      tran_id: tran_id,
      product_category: "Subscription",
      product_name: plan.name,
      product_profile: "general",
      cus_name: user.name,
      cus_email: user.email,
      cus_add1: "N/A",
      cus_city: "N/A",
      cus_postcode: "N/A",
      cus_country: "Bangladesh",
      cus_phone: user.phone || "N/A",
      ship_name: "N/A",
      ship_add1: "N/A",
      ship_city: "N/A",
      ship_postcode: "N/A",
      ship_country: "Bangladesh",
      success_url: `${process.env.API_URL}/api/pricing/payment-success?tran_id=${tran_id}`,
      fail_url: `${process.env.API_URL}/api/pricing/payment-fail?tran_id=${tran_id}`,
      cancel_url: `${process.env.API_URL}/api/pricing/payment-cancel?tran_id=${tran_id}`,
      ipn_url: `${process.env.API_URL}/api/pricing/ssl-callback`,
      shipping_method: "NO",
      multi_card_name: "",
      value_a: user._id.toString(),
      value_b: planId,
      value_c: "subscription",
      value_d: "USD",
      store_id: store_id,
      store_passwd: store_passwd,
      is_live: is_live
    };

    // Save transaction ID and plan ID to user
    await User.findByIdAndUpdate(user._id, {
      transaction_id: tran_id,
      pending_plan_id: planId
    });

    // Initialize payment
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);

    if (apiResponse) {
      res.json({
        success: true,
        data: {
          gateway_url: apiResponse.GatewayPageURL,
          session_id: apiResponse.sessionkey,
        },
      });
    } else {
      throw new Error(apiResponse.failedreason || "Failed to initialize payment");
    }
  } catch (error) {
    console.error("Payment initialization error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error initializing payment",
      error: error.message
    });
  }
});

// SSL Commerz callback
router.post("/ssl-callback", async (req, res) => {
  try {
    const {
      tran_id,
      status,
      val_id,
      amount,
      store_amount,
      card_type,
      bank_tran_id,
      value_a, // user_id
      value_b, // plan_id
    } = req.body;

    // Verify transaction
    const verificationData = {
      val_id: val_id,
    };

    const verificationResponse = await sslcz.validate(verificationData);
    console.log("Verification Response:", verificationResponse);

    if (verificationResponse.status === "VALID") {
      const user = await User.findById(value_a);
      if (!user) {
        throw new Error("User not found");
      }

      // Calculate expiry date based on plan
      const expiryDate = new Date();
      switch (value_b) {
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

      // Update user subscription
      user.premium = true;
      user.premium_type = value_b;
      user.premium_expiry_date = expiryDate;
      user.payment_history.push({
        amount: amount,
        currency: "USD",
        payment_id: bank_tran_id,
        payment_method: card_type,
        status: status,
        date: new Date(),
      });
      await user.save();

      res.json({ success: true, message: "Payment verified and subscription updated" });
    } else {
      throw new Error("Payment verification failed");
    }
  } catch (error) {
    console.error("Payment callback error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error processing payment callback",
      error: error.message 
    });
  }
});

// Payment success endpoint
router.post("/payment-success", async (req, res) => {
  try {
    const { tran_id } = req.query;
    
    if (!tran_id) {
      return res.status(400).json({ message: "Missing transaction ID" });
    }

    // Find user by transaction ID
    const user = await User.findOne({ transaction_id: tran_id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify payment with SSL Commerz
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    // const validation = await sslcz.validate({ val_id: tran_id });

    // if (validation.status === "VALID") {
      // Calculate expiry date based on plan type
      const expiryDate = new Date();
      switch (user.pending_plan_id) {
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

      // Update user's premium status
      await User.findByIdAndUpdate(user._id, {
        premium: true,
        premium_type: user.pending_plan_id,
        premium_expiry_date: expiryDate,
        transaction_id: null,
        pending_plan_id: null
      });

      res.redirect(`${process.env.CLIENT_URL}/payment/success`);
    
  } catch (error) {
    console.error("Payment success error:", error);
    res.redirect(`${process.env.CLIENT_URL}/payment/fail`);
  }
});

// Payment fail endpoint
router.post("/payment-fail", async (req, res) => {
  try {
    const { tran_id } = req.query;
    
    if (!tran_id) {
      return res.status(400).json({ message: "Missing transaction ID" });
    }

    // Find user and clear transaction data
    await User.findOneAndUpdate(
      { transaction_id: tran_id },
      { 
        transaction_id: null,
        pending_plan_id: null
      }
    );

    res.redirect(`${process.env.CLIENT_URL}/payment/fail`);
  } catch (error) {
    console.error("Payment fail error:", error);
    res.redirect(`${process.env.CLIENT_URL}/payment/fail`);
  }
});

// Payment cancel endpoint
router.post("/payment-cancel", async (req, res) => {
  try {
    const { tran_id } = req.query;
    
    if (!tran_id) {
      return res.status(400).json({ message: "Missing transaction ID" });
    }

    // Find user and clear transaction data
    await User.findOneAndUpdate(
      { transaction_id: tran_id },
      { 
        transaction_id: null,
        pending_plan_id: null
      }
    );

    res.redirect(`${process.env.CLIENT_URL}/payment/cancel`);
  } catch (error) {
    console.error("Payment cancel error:", error);
    res.redirect(`${process.env.CLIENT_URL}/payment/cancel`);
  }
});

// Helper function to get plan details
const getPlanDetails = (planId) => {
  const plans = {
    monthly: { price: 9.99, name: "Monthly Plan" },
    quarterly: { price: 24.99, name: "Quarterly Plan" },
    yearly: { price: 89.99, name: "Yearly Plan" },
  };
  return plans[planId];
};

module.exports = router; 