const AILearningSession = require('../models/AILearningSession');
const aiService = require('./aiService');
const difyService = require('./difyService');

class AIFlowService {
    constructor() {
        // Bind methods to ensure 'this' context is preserved
        this.startSession = this.startSession.bind(this);
        this.processStep = this.processStep.bind(this);
        this.triggerLearningStep = this.triggerLearningStep.bind(this);
        this.handleLearningStep = this.handleLearningStep.bind(this);
    }

    // Stage configurations (API Keys should ideally come from env or config)
    getFlowKey(flowName) {
        const keys = {
            'welcoming': process.env.DIFY_KEY_WELCOMING,
            'ready_check': process.env.DIFY_KEY_READY_CHECK,
            'topic_init': process.env.DIFY_KEY_TOPIC_INIT, // Topic flow
            'separation': process.env.DIFY_KEY_SEPARATION,
            'question': process.env.DIFY_KEY_QUESTION,
            'answer': process.env.DIFY_KEY_ANSWER,
            're-lesson': process.env.DIFY_KEY_RELESSON
        };
        return keys[flowName];
    }

    async startSession(externalStudentId) {
        const session = await AILearningSession.create({
            externalStudentId,
            currentStage: 'welcoming',
            metadata: {
                scores: []
            }
        });

        // Initial Welcoming flow
        const response = await this.processStep(session.id, {});
        return { sessionId: session.id, ...response };
    }

    async processStep(sessionId, studentInput) {
        const session = await AILearningSession.findById(sessionId);
        if (!session) throw new Error('Session not found');

        let difyResponse;
        let nextStage = session.currentStage;
        let responseText = '';

        switch (session.currentStage) {
            case 'welcoming':
                difyResponse = await difyService.callWorkflow(
                    this.getFlowKey('welcoming'),
                    { topic: 'Temel İlk Yardım Eğitimi', name: 'Öğrenci' }, // Updated default topic
                    session.externalStudentId || session._id.toString()
                );
                responseText = difyResponse.data.outputs.text;
                nextStage = 'ready_check';
                break;

            case 'ready_check':
                const userInput = (studentInput.text || '').toLowerCase();
                difyResponse = await difyService.callWorkflow(
                    this.getFlowKey('ready_check'),
                    { input: userInput },
                    session.externalStudentId || session._id.toString()
                );
                responseText = difyResponse.data.outputs.text;
                // logic to determine transition if 'yes'
                if (userInput.includes('evet') || userInput.includes('hazırım')) {
                    nextStage = 'topic_init';
                }
                break;

            case 'topic_init':
                // User provides topic and name
                session.topicName = studentInput.topic;
                session.studentName = studentInput.name;

                difyResponse = await difyService.callWorkflow(
                    this.getFlowKey('topic_init'),
                    { topic: session.topicName, name: session.studentName },
                    session.externalStudentId || session._id.toString()
                );
                responseText = difyResponse.data.outputs.text;
                nextStage = 'separation';
                break;

            case 'separation':
                difyResponse = await difyService.callWorkflow(
                    this.getFlowKey('separation'),
                    { topic: session.topicName },
                    session.externalStudentId || session._id.toString()
                );
                responseText = difyResponse.data.outputs.text;

                // Parse topics from XML-like format <topics>...</topics>
                const topics = this.parseTopics(responseText);
                session.subTopics = topics;
                session.currentSubTopicIndex = 0;
                nextStage = 'learning';

                // After separation, we immediately trigger the first question of the first topic
                return await this.triggerLearningStep(session);

            case 'learning':
                return await this.handleLearningStep(session, studentInput);

            default:
                throw new Error('Invalid stage');
        }

        session.currentStage = nextStage;
        await session.save();

        // Log interaction
        await aiService.logInteraction({
            sessionId: session.id,
            type: 'explanation',
            prompt: JSON.stringify(studentInput),
            response: responseText,
            difyFlowId: session.currentStage
        });

        return { text: responseText, stage: session.currentStage };
    }

    async triggerLearningStep(session) {
        const currentTopic = session.subTopics[session.currentSubTopicIndex];

        const difyResponse = await difyService.callWorkflow(
            this.getFlowKey('question'),
            { topic: currentTopic },
            session.externalStudentId || session._id.toString()
        );

        const responseText = difyResponse.data.outputs.text;

        await aiService.logInteraction({
            sessionId: session.id,
            type: 'question',
            prompt: `Topic: ${currentTopic}`,
            response: responseText
        });

        session.metadata.lastQuestion = responseText;
        await session.save();

        return { text: responseText, stage: 'learning', currentTopic };
    }

    async handleLearningStep(session, studentInput) {
        const currentTopic = session.subTopics[session.currentSubTopicIndex];

        // 1. Scoring the answer
        const scoreResponse = await difyService.callWorkflow(
            this.getFlowKey('answer'),
            {
                topic: currentTopic,
                question: session.metadata.lastQuestion,
                answer: studentInput.text
            },
            session.externalStudentId || session._id.toString()
        );

        const score = parseInt(scoreResponse.data.outputs.score); // Assuming 'score' output
        session.metadata.scores.push(score);

        if (score < 5) {
            // 2a. Re-Lesson logic
            const reLessonResponse = await difyService.callWorkflow(
                this.getFlowKey('re-lesson'),
                { topic: currentTopic },
                session.externalStudentId || session._id.toString()
            );

            await session.save();
            return {
                text: reLessonResponse.data.outputs.text,
                score,
                status: 'retry',
                message: 'Puan düşük, konuyu tekrar ele alıyoruz.'
            };
        } else {
            // 2b. Move to next topic or complete
            session.currentSubTopicIndex += 1;
            if (session.currentSubTopicIndex >= session.subTopics.length) {
                session.currentStage = 'completed';
                session.status = 'completed';
                await session.save();
                return { text: 'Eğitimi başarıyla tamamladın!', stage: 'completed' };
            } else {
                await session.save();
                // Trigger next topic's question
                return await this.triggerLearningStep(session);
            }
        }
    }

    parseTopics(text) {
        const regex = /<topics>([\s\S]*?)<\/topics>/i;
        const match = text.match(regex);
        if (match && match[1]) {
            // Assuming comma-separated or newline-separated inside the tag
            return match[1].split(/,|\n/).map(t => t.trim()).filter(t => t.length > 0);
        }
        return [];
    }
}

module.exports = new AIFlowService();
