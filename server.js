const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const { swaggerUi, specs } = require('./src/config/swagger');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = require('http').createServer(app);
const { initSocket } = require('./src/config/socket');

// Initialize Sockets
initSocket(server);

// Body parser
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'ClimbLearn API is running' });
});

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/api', require('./src/routes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  res.status(500).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
