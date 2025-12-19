const aiService = require('../services/aiService');

exports.getLogs = async (req, res) => {
    try {
        const { sessionId } = req.query;
        if (!sessionId) {
            return res.status(400).json({ message: 'sessionId is required' });
        }
        const logs = await aiService.getLogsBySession(sessionId);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createLog = async (req, res) => {
    try {
        const log = await aiService.logInteraction(req.body);
        res.status(201).json(log);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
