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
 *               - language
 *               - code
 *               - input
 *               - output
 *               - isError
 *             properties:
 *               language:
 *                 type: string
 *                 description: Language of the code
 *               code:
 *                 type: string
 *                 description: Code to execute
 *               input:
 *                 type: string
 *                 description: Input for the code execution
 *               output:
 *                 type: string
 *                 description: Output of the code execution
 *               isError:
 *                 type: boolean
 *                 description: Whether the execution resulted in an error
 */
router.post("/", auth, async (req, res) => {
  try {
    const { language, code, input, output, isError } = req.body;

    if (!language || !code) {
      return res.status(400).json({ message: "Language and code are required" });
    }

    // Create execution record
    const execution = new CodeExecution({
      user: req.user.id,
      language,
      sourceCode: code,
      input,
      output,
      status: isError ? "error" : "success",
      error: isError ? {
        message: typeof output === 'string' ? output : JSON.stringify(output),
        type: "execution_error"
      } : null
    });

    await execution.save();

    // Analyze code with GPT
    await analyzeCodeWithGPT(execution);

    res.status(201).json(execution);
  } catch (error) {
    console.error("Error in code execution:", error);
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

    // Always analyze code with GPT
    await analyzeCodeWithGPT(execution);

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
      
      // Analyze error with GPT
      await analyzeCodeWithGPT(execution);
    }
  }
}

/**
 * Analyze code with GPT
 * @param {Object} execution - Execution record
 */
async function analyzeCodeWithGPT(execution) {
  try {
    const isError = execution.status === "error";
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a code analysis expert. Analyze the code and provide detailed feedback."
        },
        {
          role: "user",
          content: `Analyze this code and provide feedback:
            Language: ${execution.language}
            Code: ${execution.sourceCode}
            ${isError ? `Error: ${execution.error.message}` : `Output: ${execution.output}`}
            
            Please provide:
            1. A brief explanation of what the code does
            2. Analysis of the code quality and structure
            3. Suggestions for improvement
            ${isError ? "4. Detailed explanation of the error and how to fix it" : "4. Potential edge cases or bugs to watch out for"}
            5. Best practices that could be applied
            
            Format your response in markdown.`
        }
      ],
      max_tokens: 1000
    });

    const analysis = completion.choices[0].message.content;

    // Update execution with AI analysis
    execution.aiAnalysis = {
      errorCause: isError ? analysis : null,
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