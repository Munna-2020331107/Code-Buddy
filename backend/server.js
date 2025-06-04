require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDB = require("./config/db");
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

// Import routes
const authRoutes = require("./routes/auth");
const codeRoutes = require("./routes/code");
const codeExecutionRoutes = require("./routes/codeExecution");
const imageToCodeRoutes = require("./routes/imageToCode");
const learningScheduleRoutes = require("./routes/learningSchedule");
const codeCollaborationRoutes = require("./routes/codeCollaboration");

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

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
app.use("/api/code-collaboration", codeCollaborationRoutes);

// WebSocket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.user.id);

  // Join a collaboration room
  socket.on('join-collaboration', async (collaborationId) => {
    try {
      const CodeCollaboration = require('./models/CodeCollaboration');
      const collaboration = await CodeCollaboration.findById(collaborationId);

      if (!collaboration) {
        socket.emit('error', 'Collaboration not found');
        return;
      }

      // Check permissions
      const isOwner = collaboration.owner.toString() === socket.user.id;
      const isCollaborator = collaboration.collaborators.some(
        c => c.user.toString() === socket.user.id
      );
      const isPublic = collaboration.shareSettings.isPublic;

      if (!isOwner && !isCollaborator && !isPublic) {
        socket.emit('error', 'Not authorized');
        return;
      }

      // Join room
      socket.join(collaborationId);

      // Add user to active users
      collaboration.activeUsers.push({
        user: socket.user.id,
        socketId: socket.id,
        lastActive: new Date()
      });
      await collaboration.save();

      // Notify others
      socket.to(collaborationId).emit('user-joined', {
        userId: socket.user.id,
        username: socket.user.name
      });

      // Send current code and active users to the new user
      socket.emit('sync-code', {
        code: collaboration.code,
        version: collaboration.version,
        activeUsers: collaboration.activeUsers
      });
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  // Handle code changes
  socket.on('code-change', async (data) => {
    try {
      const { collaborationId, changes, version } = data;
      const CodeCollaboration = require('./models/CodeCollaboration');
      const collaboration = await CodeCollaboration.findById(collaborationId);

      if (!collaboration) {
        socket.emit('error', 'Collaboration not found');
        return;
      }

      // Check if user has edit permission
      const isOwner = collaboration.owner.toString() === socket.user.id;
      const isEditor = collaboration.collaborators.some(
        c => c.user.toString() === socket.user.id && c.role === 'editor'
      );

      if (!isOwner && !isEditor) {
        socket.emit('error', 'Not authorized to edit');
        return;
      }

      // Apply changes
      collaboration.code = changes;
      collaboration.version = version + 1;
      collaboration.lastEdited = {
        by: socket.user.id,
        at: new Date()
      };

      // Save previous version
      collaboration.previousVersions.push({
        code: changes,
        version: version,
        editedBy: socket.user.id
      });

      await collaboration.save();

      // Broadcast changes to other users
      socket.to(collaborationId).emit('code-update', {
        changes,
        version: collaboration.version,
        editedBy: socket.user.id
      });
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  // Handle cursor movement
  socket.on('cursor-move', (data) => {
    const { collaborationId, cursor } = data;
    socket.to(collaborationId).emit('cursor-update', {
      userId: socket.user.id,
      cursor
    });
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    try {
      const CodeCollaboration = require('./models/CodeCollaboration');
      
      // Remove user from active users in all collaborations
      await CodeCollaboration.updateMany(
        { 'activeUsers.socketId': socket.id },
        { $pull: { activeUsers: { socketId: socket.id } } }
      );

      // Notify others in the rooms
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.to(room).emit('user-left', {
            userId: socket.user.id
          });
        }
      });
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
