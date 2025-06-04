const express = require("express");
const router = express.Router();
const ImageToCode = require("../models/ImageToCode");
const { Configuration, OpenAIApi } = require("openai");
const auth = require("../middleware/auth");
const premium = require("../middleware/premium");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * @swagger
 * /api/image-to-code:
 *   post:
 *     summary: Convert image to code
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
  try {
    const { imageUrl } = req.body;

    // Create new conversion record
    const conversion = new ImageToCode({
      user: req.user.id,
      imageUrl,
      status: "processing"
    });

    await conversion.save();

    // Process image in background
    processImage(conversion._id);

    res.status(201).json(conversion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Process image and convert to code
 * @param {string} conversionId - ID of the conversion record
 */
async function processImage(conversionId) {
  try {
    const conversion = await ImageToCode.findById(conversionId);
    if (!conversion) return;

    // TODO: Implement actual image processing and OCR
    // For now, we'll simulate the process with GPT
    const completion = await openai.createChatCompletion({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: "You are a code extraction expert. Extract code from the image and format it properly."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract and format the code from this image:" },
            { type: "image_url", image_url: conversion.imageUrl }
          ]
        }
      ],
      max_tokens: 1000
    });

    const extractedCode = completion.data.choices[0].message.content;

    // Update conversion record
    conversion.originalText = extractedCode;
    conversion.convertedCode = extractedCode;
    conversion.status = "completed";
    await conversion.save();

    // Create code execution record if needed
    if (conversion.convertedCode) {
      // TODO: Implement code execution
    }
  } catch (error) {
    const conversion = await ImageToCode.findById(conversionId);
    if (conversion) {
      conversion.status = "failed";
      conversion.error = {
        message: error.message,
        type: "processing_error"
      };
      await conversion.save();
    }
  }
}

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