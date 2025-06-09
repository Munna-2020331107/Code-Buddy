const express = require("express");
const router = express.Router();
const ImageToCode = require("../models/ImageToCode");
const OpenAI = require("openai");
const auth = require("../middleware/auth");
const premium = require("../middleware/premium");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to extract JSON from text
const extractJsonFromText = (text) => {
  try {
    // Find the first occurrence of { and last occurrence of }
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      return null;
    }
    
    const jsonStr = text.slice(startIndex, endIndex + 1);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
};

/**
 * @swagger
 * /api/image-to-code:
 *   post:
 *     summary: Convert image to code using DALL-E-3
 *     tags: [Image to Code]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: URL of the image containing code
 */
router.post("/", auth, premium, async (req, res) => {
  let conversion;
  try {
    const { imageUrl } = req.body;

    // Create new conversion record
    conversion = new ImageToCode({
      user: req.user.id,
      imageUrl,
      status: "processing"
    });

    await conversion.save();

    console.log("Processing image:", imageUrl);

    // Process image using GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a code extraction expert. Extract code from the image and format it properly. Return the code in a structured json format with language detection. The json should be in the following format: { code: string, language: string }"
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract and format the code from this image. Also detect the programming language:" },
            { 
              type: "image_url", 
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    console.log("Model Response:", {
      model: completion.model,
      usage: completion.usage,
      choices: completion.choices.map(choice => ({
        message: choice.message,
        finish_reason: choice.finish_reason
      }))
    });

    const extractedText = completion.choices[0].message.content;
    console.log("Raw Extracted Text:", extractedText);

    // Try to extract JSON from the response
    const extractedJson = extractJsonFromText(extractedText);
    console.log("Extracted JSON:", extractedJson);

    // If JSON extraction failed, use the raw text
    const extractedCode = extractedJson ? extractedJson.code : extractedText;

    // Update conversion record
    conversion.originalText = extractedText;
    conversion.convertedCode = extractedCode;
    conversion.status = "completed";
    await conversion.save();

    // Return the response immediately
    res.status(200).json({
      success: true,
      data: {
        id: conversion._id,
        code: extractedCode,
        status: "completed",
        createdAt: conversion.createdAt
      }
    });

  } catch (error) {
    console.error("Error processing image:", error);

    // Update conversion record with error if it exists
    if (conversion) {
      conversion.status = "failed";
      conversion.error = {
        message: error.message,
        type: "processing_error"
      };
      await conversion.save();
    }

    res.status(500).json({ 
      success: false,
      message: error.message,
      error: {
        type: "processing_error",
        details: error.message
      }
    });
  }
});

/**
 * @swagger
 * /api/image-to-code:
 *   get:
 *     summary: Get all image to code conversions for the user
 *     tags: [Image to Code]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", auth, async (req, res) => {
  try {
    const conversions = await ImageToCode.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(conversions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/image-to-code/{id}:
 *   get:
 *     summary: Get a specific image to code conversion
 *     tags: [Image to Code]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const conversion = await ImageToCode.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!conversion) {
      return res.status(404).json({ message: "Conversion not found" });
    }

    res.json(conversion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/image-to-code/{id}/retry:
 *   post:
 *     summary: Retry failed image to code conversion
 *     tags: [Image to Code]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/retry", auth, async (req, res) => {
  try {
    const conversion = await ImageToCode.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!conversion) {
      return res.status(404).json({ message: "Conversion not found" });
    }

    if (conversion.status !== "failed") {
      return res.status(400).json({ message: "Can only retry failed conversions" });
    }

    conversion.status = "processing";
    conversion.error = null;
    await conversion.save();

    // Process image in background
    processImage(conversion._id);

    res.json(conversion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/image-to-code/{id}:
 *   delete:
 *     summary: Delete an image to code conversion
 *     tags: [Image to Code]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const conversion = await ImageToCode.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!conversion) {
      return res.status(404).json({ message: "Conversion not found" });
    }

    res.json({ message: "Conversion deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 