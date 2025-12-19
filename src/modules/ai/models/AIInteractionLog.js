const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     AIInteractionLog:
 *       type: object
 *       required:
 *         - sessionId
 *         - type
 *         - prompt
 *         - response
 *       properties:
 *         sessionId: { type: string }
 *         type:
 *           type: string
 *           enum: [explanation, question, evaluation]
 *         prompt: { type: string }
 *         response: { type: string }
 *         model: { type: string }
 *         difyFlowId: { type: string }
 */

const aiInteractionLogSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AILearningSession',
        required: true,
        index: true
    },

    type: {
        type: String,
        enum: ['explanation', 'question', 'evaluation'],
    },

    prompt: String,
    response: String,

    model: String,
    difyFlowId: String,

    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AIInteractionLog', aiInteractionLogSchema);
