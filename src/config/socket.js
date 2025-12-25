const { Server } = require('socket.io');

/**
 * @swagger
 * /socket.io:
 *   get:
 *     summary: "[Real-time] Socket.io Event Documentation"
 *     description: |
 *       This is a virtual endpoint documenting the Socket.io events.
 *       Connection URL: `ws://localhost:5000`
 *
 *       **1. Join Room**
 *       - Event: `join_admin_room`
 *       - Purpose: Joins the admin dashboard room to receive live interactions.
 *
 *       **2. Receive Interactions**
 *       - Event: `new_interaction`
 *       - Payload: The `AIInteractionLog` object.
 *     tags: [Real-time (Pulse)]
 *     responses:
 *       101:
 *         description: Switching Protocols to WebSocket
 */
let io;

/**
 * Initialize Socket.io
 * @param {import('http').Server} server
 */
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    socket.on('join_admin_room', () => {
      socket.join('admin_dashboard');
      console.log(`Client ${socket.id} joined Admin Dashboard room`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket Disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get Socket.io instance
 */
const getIO = () => {
  if (!io) {
    // We will return a mock if not initialized yet to prevent crashes
    return {
      to: () => ({ emit: () => {} }),
      emit: () => {},
    };
  }
  return io;
};

module.exports = { initSocket, getIO };
