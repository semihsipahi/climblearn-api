const express = require('express');
const router = express.Router();
const { getLogs, createLog } = require('../controllers/aiController');
const { startFlow, nextStep } = require('../controllers/flowController');
const { protectAdmin, protectClient } = require('../../auth/middleware/authMiddleware');

// All AI routes are now public as per user request

/**
 * @swagger
 * /api/ai:
 *   get:
 *     summary: Get session interaction logs
 *     description: Retrieves logs for a specific session or general AI activity.
 *     tags: [AI Learning Flow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: Optional session ID to filter logs
 *     responses:
 *       200:
 *         description: List of AI logs
 *   post:
 *     summary: Manual AI interaction log
 *     description: Creates a manual log entry for an AI interaction.
 *     tags: [AI Learning Flow]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId, type, prompt, response]
 *             properties:
 *               sessionId: { type: string }
 *               type: { type: string, enum: [explanation, question, evaluation] }
 *               prompt: { type: string }
 *               response: { type: string }
 *               model: { type: string }
 *     responses:
 *       201:
 *         description: Log created
 */
router.route('/')
    .get(protectAdmin, getLogs)
    .post(protectAdmin, createLog);

/**
 * @swagger
 * /api/ai/flow/start:
 *   post:
 *     summary: Start a new AI learning session
 *     description: Initializes a session and triggers the Welcoming stage (Real Dify - Temel İlk Yardım Eğitimi).
 *     tags: [AI Learning Flow]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               externalStudentId: { type: string, example: "STU_001" }
 *     responses:
 *       201:
 *         description: Session started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId: { type: string }
 *                 text: { type: string }
 *                 stage: { type: string }
 */
router.post('/flow/start', protectClient, startFlow);

/**
 * @swagger
 * /api/ai/flow/next:
 *   post:
 *     summary: Process next step in the learning flow
 *     description: Handles transitions (Ready Check -> Topic Init -> Separation -> Learning Loop).
 *     tags: [AI Learning Flow]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId]
 *             properties:
 *               sessionId: { type: string }
 *               input:
 *                 type: object
 *                 properties:
 *                   text: { type: string, example: "Evet Hazırım" }
 *                   topic: { type: string, example: "Temel İlk Yardım Eğitimi" }
 *                   name: { type: string, example: "Ahmet" }
 *     responses:
 *       200:
 *         description: Next stage triggered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text: { type: string }
 *                 stage: { type: string }
 */
router.post('/flow/next', protectClient, nextStep);

module.exports = router;
