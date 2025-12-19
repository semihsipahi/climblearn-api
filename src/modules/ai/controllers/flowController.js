const aiFlowService = require('../services/aiFlowService');

exports.startFlow = async (req, res) => {
    const { externalStudentId } = req.body;
    const result = await aiFlowService.startSession(externalStudentId);
    res.status(201).json(result);
};

exports.nextStep = async (req, res) => {
    const { sessionId, input } = req.body;

    if (!sessionId) {
        return res.status(400).json({ message: 'sessionId is required' });
    }

    const result = await aiFlowService.processStep(sessionId, input || {});
    res.status(200).json(result);
};
