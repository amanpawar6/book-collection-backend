const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Book API Documentation',
        version: '1.0.0',
        description: 'API documentation for the Book Management System',
    },
    servers: [
        {
            url: 'http://localhost:5000/v1/api',
            description: 'Local server',
        },
        {
            url: 'https://aman-pawar.publicvm.com/v1/api',
            description: 'Production server',
        }
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    security: [
        {
            BearerAuth: [],
        },
    ],
};

// Options for swagger-jsdoc
const options = {
    swaggerDefinition,
    apis: ['./routes/v1/routes.js'], // Path to the API routes
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };