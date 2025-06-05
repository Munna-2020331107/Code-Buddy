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
    console.error('Authentication error: No token provided');
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      console.error('Authentication error: Invalid token payload');
      return next(new Error('Authentication error: Invalid token payload'));
    }
    socket.user = decoded;
    console.log('Socket authenticated:', {
      userId: socket.user.id,
      socketId: socket.id
    });
    next();
  } catch (err) {
    console.error('Authentication error:', err.message);
    next(new Error('Authentication error: ' + err.message));
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', {
    userId: socket.user?.id,
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });

  // Join a collaboration room
  socket.on('join-collaboration', async (collaborationId) => {
    try {
      if (!socket.user || !socket.user.id) {
        throw new Error('User not authenticated');
      }

      console.log('User joining collaboration:', {
        userId: socket.user.id,
        collaborationId,
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });

      const CodeCollaboration = require('./models/CodeCollaboration');
      const collaboration = await CodeCollaboration.findById(collaborationId);

      if (!collaboration) {
        throw new Error('Collaboration not found');
      }

      // Check permissions
      const isOwner = collaboration.owner.toString() === socket.user.id;
      const isCollaborator = collaboration.collaborators.some(
        c => c.user && c.user.toString() === socket.user.id
      );
      const isPublic = collaboration.shareSettings.isPublic;

      if (!isOwner && !isCollaborator && !isPublic) {
        throw new Error('Not authorized to join this collaboration');
      }

      // Join room
      await socket.join(collaborationId);
      console.log('User joined room:', {
        userId: socket.user.id,
        collaborationId,
        socketId: socket.id
      });

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
        username: socket.user.name,
        timestamp: new Date().toISOString()
      });

      // Send current code and active users to the new user
      socket.emit('sync-code', {
        code: collaboration.code,
        version: collaboration.version,
        activeUsers: collaboration.activeUsers,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in join-collaboration:', error);
      socket.emit('error', error.message);
    }
  });

  // Handle code changes
  socket.on('code-change', async (data) => {
    try {
      if (!socket.user || !socket.user.id) {
        throw new Error('User not authenticated');
      }

      const { collaborationId, changes, version } = data;
      console.log('Received code change:', {
        userId: socket.user.id,
        changes,
        collaborationId,
        version,
        timestamp: new Date().toISOString()
      });

      const CodeCollaboration = require('./models/CodeCollaboration');
      const collaboration = await CodeCollaboration.findById(collaborationId);

      if (!collaboration) {
        throw new Error('Collaboration not found');
      }

      // Check if user has edit permission
      console.log("=== Authorization Debug ===");
      console.log("1. Current User:", {
        socketUserId: socket.user.id,
        timestamp: new Date().toISOString()
      });

      console.log("2. Workspace Details:", {
        workspaceId: collaboration._id,
        ownerId: collaboration.owner ? collaboration.owner.toString() : 'undefined',
        totalCollaborators: collaboration.collaborators.length
      });

      console.log("3. Collaborators List:", collaboration.collaborators.map(c => ({
        userId: c.user ? c.user.toString() : 'undefined',
        role: c.role,
        joinedAt: c.joinedAt
      })));

      const isOwner = collaboration.owner && collaboration.owner.toString() === socket.user.id;
      const isEditor = collaboration.collaborators.some(
        c => c.user && c.user.toString() === socket.user.id && c.role === 'editor'
      );

      console.log("4. Permission Check:", {
        isOwner,
        isEditor,
        hasEditPermission: isOwner || isEditor
      });

      if (!isOwner && !isEditor) {
        console.log("5. Access Denied:", {
          reason: "User is neither owner nor editor",
          userId: socket.user.id
        });
        throw new Error('Not authorized to edit');
      }

      console.log("5. Access Granted:", {
        userId: socket.user.id,
        reason: isOwner ? "User is owner" : "User is editor"
      });

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

      // Broadcast to ALL users in the room (including sender)
      const updateData = {
        collaborationId,
        changes,
        version: collaboration.version,
        editedBy: socket.user.id,
        timestamp: new Date().toISOString()
      };

      console.log('Broadcasting code update:', {
        ...updateData,
        room: collaborationId,
        totalUsers: io.sockets.adapter.rooms.get(collaborationId)?.size || 0
      });

      // Use io.in instead of socket.emit to broadcast to all clients
      io.in(collaborationId).emit('code-update', updateData);

      // Send acknowledgment to the sender
      socket.emit('code-update-ack', {
        success: true,
        version: collaboration.version,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in code-change:', error);
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
