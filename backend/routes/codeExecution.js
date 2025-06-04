const express = require("express");
const router = express.Router();
const CodeExecution = require("../models/CodeExecution");
const Code = require("../models/Code");
const OpenAI = require("openai");
const auth = require("../middleware/auth");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * @swagger
 * /api/code-execution:
 *   post:
 *     summary: Execute code
 *     tags: [Code Execution]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codeId
 *               - input
 *             properties:
 *               codeId:
 *                 type: string
 *                 description: ID of the code to execute
 *               input:
 *                 type: string
 *                 description: Input for the code execution
 */
router.post("/", auth, async (req, res) => {
  try {
    const { codeId, input } = req.body;

    // Get code from database
    const code = await Code.findOne({
      _id: codeId,
      user: req.user.id
    });

    if (!code) {
      return res.status(404).json({ message: "Code not found" });
    }

    // Create execution record
    const execution = new CodeExecution({
      user: req.user.id,
      code: codeId,
      input,
      status: "processing"
    });

    await execution.save();

    // Execute code in background
    executeCode(execution._id);

    res.status(201).json(execution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Execute code and analyze results
 * @param {string} executionId - ID of the execution record
 */
async function executeCode(executionId) {
  try {
    const execution = await CodeExecution.findById(executionId)
      .populate("code");
    
    if (!execution) return;

    const startTime = Date.now();

    // TODO: Implement actual code execution
    // For now, we'll simulate execution
    const output = "Simulated output";
    const executionTime = Date.now() - startTime;

    // Update execution record
    execution.output = output;
    execution.executionTime = executionTime;
    execution.status = "success";
    await execution.save();

    // Analyze code with GPT if there are errors
    if (output.includes("error") || output.includes("Error")) {
      await analyzeCodeWithGPT(execution);
    }

    // Update code execution count
    await Code.findByIdAndUpdate(execution.code._id, {
      $inc: { executionCount: 1 },
      lastExecuted: new Date()
    });
  } catch (error) {
    const execution = await CodeExecution.findById(executionId);
    if (execution) {
      execution.status = "error";
      execution.error = {
        message: error.message,
        type: "execution_error"
      };
      await execution.save();
    }
  }
}

/**
 * Analyze code with GPT
 * @param {Object} execution - Execution record
 */
async function analyzeCodeWithGPT(execution) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a code analysis expert. Analyze the code and provide suggestions for improvement."
        },
        {
          role: "user",
          content: `Analyze this code and its output:
            Code: ${execution.code.code}
            Output: ${execution.output}
            Error: ${execution.error?.message || "No error"}`
        }
      ],
      max_tokens: 1000
    });

    const analysis = completion.choices[0].message.content;

    // Update execution with AI analysis
    execution.aiAnalysis = {
      errorCause: analysis,
      suggestions: [analysis],
      complexity: "medium" // TODO: Implement complexity analysis
    };
    await execution.save();
  } catch (error) {
    console.error("GPT analysis failed:", error);
  }
}

/**
 * @swagger
 * /api/code-execution:
 *   get:
 *     summary: Get all code executions for the user
 *     tags: [Code Execution]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", auth, async (req, res) => {
  try {
    const executions = await CodeExecution.find({ user: req.user.id })
      .populate("code", "title language")
      .sort({ createdAt: -1 });
    res.json(executions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/code-execution/{id}:
 *   get:
 *     summary: Get a specific code execution
 *     tags: [Code Execution]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const execution = await CodeExecution.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate("code", "title language code");

    if (!execution) {
      return res.status(404).json({ message: "Execution not found" });
    }

    res.json(execution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/code-execution/code/{codeId}:
 *   get:
 *     summary: Get all executions for a specific code
 *     tags: [Code Execution]
 *     security:
 *       - bearerAuth: []
 */
router.get("/code/:codeId", auth, async (req, res) => {
  try {
    const executions = await CodeExecution.find({
      code: req.params.codeId,
      user: req.user.id
    }).sort({ createdAt: -1 });

    res.json(executions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/code-execution/{id}:
 *   delete:
 *     summary: Delete a code execution
 *     tags: [Code Execution]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const execution = await CodeExecution.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!execution) {
      return res.status(404).json({ message: "Execution not found" });
    }

    res.json({ message: "Execution deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 