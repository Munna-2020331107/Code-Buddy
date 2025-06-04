require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/auth");
const codeRoutes = require("./routes/code");
const codeExecutionRoutes = require("./routes/codeExecution");
const imageToCodeRoutes = require("./routes/imageToCode");
const learningScheduleRoutes = require("./routes/learningSchedule");

connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/code-execution", codeExecutionRoutes);
app.use("/api/image-to-code", imageToCodeRoutes);
app.use("/api/learning-schedule", learningScheduleRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
