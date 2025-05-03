const socketIO = require('socket.io');

let io;

// Initialize Socket.IO with the HTTP server
module.exports.init = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join rooms based on role and entity IDs
    socket.on('join', (rooms) => {
      if (Array.isArray(rooms)) {
        rooms.forEach(room => {
          socket.join(room);
          console.log(`Socket ${socket.id} joined room: ${room}`);
        });
      } else if (rooms) {
        socket.join(rooms);
        console.log(`Socket ${socket.id} joined room: ${rooms}`);
      }
    });

    // Leave rooms
    socket.on('leave', (rooms) => {
      if (Array.isArray(rooms)) {
        rooms.forEach(room => {
          socket.leave(room);
          console.log(`Socket ${socket.id} left room: ${room}`);
        });
      } else if (rooms) {
        socket.leave(rooms);
        console.log(`Socket ${socket.id} left room: ${rooms}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

// Get the initialized io instance
module.exports.getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Emit events for different actions
module.exports.emitSubmissionCreated = (submission) => {
  if (!io) return;
  
  // Emit to tender-specific room
  io.to(`tender:${submission.tenderId}`).emit('submission:created', {
    action: 'create',
    data: submission
  });
  
  // Emit to general submissions room
  io.to('submissions').emit('submission:created', {
    action: 'create',
    data: submission
  });
};

module.exports.emitSubmissionUpdated = (submission) => {
  if (!io) return;
  
  // Emit to submission-specific room
  io.to(`submission:${submission._id}`).emit('submission:updated', {
    action: 'update',
    data: submission
  });
  
  // Emit to tender-specific room
  io.to(`tender:${submission.tenderId}`).emit('submission:updated', {
    action: 'update',
    data: submission
  });
};

module.exports.emitSubmissionDeleted = (submission) => {
  if (!io) return;
  
  // Emit to tender-specific room
  io.to(`tender:${submission.tenderId}`).emit('submission:deleted', {
    action: 'delete',
    data: submission
  });
  
  // Emit to general submissions room
  io.to('submissions').emit('submission:deleted', {
    action: 'delete',
    data: submission
  });
};

module.exports.emitEvaluationCreated = (evaluation) => {
  if (!io) return;
  
  // Emit to submission-specific room
  io.to(`submission:${evaluation.submissionId}`).emit('evaluation:created', {
    action: 'create',
    data: evaluation
  });
  
  // Emit to general evaluations room
  io.to('evaluations').emit('evaluation:created', {
    action: 'create',
    data: evaluation
  });
};

module.exports.emitEvaluationUpdated = (evaluation) => {
  if (!io) return;
  
  // Emit to evaluation-specific room
  io.to(`evaluation:${evaluation._id}`).emit('evaluation:updated', {
    action: 'update',
    data: evaluation
  });
  
  // Emit to submission-specific room
  io.to(`submission:${evaluation.submissionId}`).emit('evaluation:updated', {
    action: 'update',
    data: evaluation
  });
};

module.exports.emitEvaluationDeleted = (evaluation) => {
  if (!io) return;
  
  // Emit to submission-specific room
  io.to(`submission:${evaluation.submissionId}`).emit('evaluation:deleted', {
    action: 'delete',
    data: evaluation
  });
  
  // Emit to general evaluations room
  io.to('evaluations').emit('evaluation:deleted', {
    action: 'delete',
    data: evaluation
  });
}; 