const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ClimbLearn API',
            version: '1.0.0',
            description: 'AI Driven Adaptive Learning Platform API Documentation',
            contact: {
                name: 'ClimbLearn Support',
            },
        },
        tags: [
            { name: 'Auth', description: 'Admin authentication and session management' },
            { name: 'AI Learning Flow', description: 'Core adaptive learning logic and state machine' },
            { name: 'Real-time (Pulse)', description: 'WebSocket events for live dashboard monitoring' }
        ],
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                apiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-api-key',
                },
            },
        },
        security: [],
    },
    apis: ['./src/**/*.js'], // Path to the API docs (recursive lookup)
};

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs,
};
