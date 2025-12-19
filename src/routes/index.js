const express = require('express');
const router = express.Router();

const aiRoutes = require('../modules/ai/routes/aiRoutes');
const authRoutes = require('../modules/auth/routes/authRoutes');

// Routes
router.use('/auth', authRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
