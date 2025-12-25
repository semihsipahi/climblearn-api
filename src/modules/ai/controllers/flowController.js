const aiFlowService = require('../services/aiFlowService');

exports.startFlow = async (req, res) => {
  const { externalStudentId, studentName } = req.body;
  const result = await aiFlowService.startSession(externalStudentId, studentName);
  res.status(201).json(result);
};

exports.nextStep = async (req, res) => {
  console.log('--- NEXT STEP REQUEST ---');
  console.log('Body:', JSON.stringify(req.body, null, 2));

  const { sessionId, inputs } = req.body;

  if (!sessionId) {
    return res.status(400).json({ message: 'sessionId is required' });
  }
  const result = await aiFlowService.processStep(sessionId, inputs || {});
  res.status(200).json(result);
};
