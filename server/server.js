const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const connectDB = require('./config/db');
const socketIO = require('./utils/socketIO');

// Import routes
const userRoutes = require('./routes/userRoutes');
const tenderRoutes = require('./routes/tenderRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
socketIO.init(server);

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up API routes with consistent prefixes
app.use('/api/users', userRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/ai', aiRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Tender Management API',
    documentation: '/api-docs',
    api_endpoints: {
      users: '/api/users',
      tenders: '/api/tenders',
      submissions: '/api/submissions',
      evaluations: '/api/evaluations',
      ai: '/api/ai'
    }
  });
});

// Setup Swagger documentation - after routes are defined
const setupSwagger = require('./config/swagger');
setupSwagger(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

module.exports = app; 