const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     AILearningSession:
 *       type: object
 *       properties:
 *         externalStudentId: { type: string }
 *         topicName: { type: string }
 *         studentName: { type: string }
 *         currentStage:
 *           type: string
 *           enum: [welcoming, ready_check, topic_init, separation, learning, completed]
 *         subTopics:
 *           type: array
 *           items: { type: string }
 *         currentSubTopicIndex: { type: number }
 *         status:
 *           type: string
 *           enum: [active, completed, cancelled]
 *         metadata: { type: object }
 */

const aiLearningSessionSchema = new mongoose.Schema({
  externalStudentId: String,
  topicName: String,
  studentName: String,

  currentStage: {
    type: String,
    enum: ['welcoming', 'ready_check', 'topic_init', 'separation', 'learning', 'completed'],
    default: 'welcoming',
  },

  subTopics: [String],
  currentSubTopicIndex: {
    type: Number,
    default: 0,
  },

  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  },

  metadata: {
    difyConversationId: String,
    lastDifyResponse: Object,
    scores: [Number], // Scores for each sub-topic/question
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

aiLearningSessionSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('AILearningSession', aiLearningSessionSchema);
