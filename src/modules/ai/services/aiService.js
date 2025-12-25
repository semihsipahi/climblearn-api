const AIInteractionLog = require('../models/AIInteractionLog');
const { getIO } = require('../../../config/socket');

class AIService {
  async logInteraction(logData) {
    const log = await AIInteractionLog.create(logData);

    // Broadcast to Admin Dashboard Room
    getIO().to('admin_dashboard').emit('new_interaction', log);

    return log;
  }

  async getLogsBySession(sessionId) {
    return await AIInteractionLog.find({ sessionId }).sort('createdAt');
  }
}

module.exports = new AIService();
