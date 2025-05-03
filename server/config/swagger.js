const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

// Paths to the API docs
const routesDir = path.resolve(__dirname, '../routes');
const controllersDir = path.resolve(__dirname, '../controllers');
const modelsDir = path.resolve(__dirname, '../models');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tender Management API',
      version: '1.0.0',
      description: 'API documentation for Tender Management System',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'API Support',
        email: 'support@tenderapi.com',
      },
    },
    servers: [
      {
        url: '/',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Tenders',
        description: 'Tender management endpoints',
      },
      {
        name: 'Submissions',
        description: 'Submission management endpoints',
      },
      {
        name: 'Evaluations',
        description: 'Evaluation management endpoints',
      },
    ],
  },
  // Enable Swagger to scan comments from all relevant files
  apis: [
    `${routesDir}/*.js`,
    `${controllersDir}/*.js`,
    `${modelsDir}/*.js`,
  ],
};

const specs = swaggerJsDoc(options);

module.exports = (app) => {
  // Log the detected routes for debugging
  console.log(`Swagger detected ${Object.keys(specs.paths || {}).length} API paths`);
  
  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    }
  }));
  
  // Expose Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
}; 