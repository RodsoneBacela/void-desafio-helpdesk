const express = require('express');
const cors = require('cors');
const { CLIENT_DIR } = require('./config');
const requestLogger = require('./middlewares/requestLogger');
const { notFoundHandler, globalErrorHandler } = require('./middlewares/errorHandler');
const apiRouter = require('./routes');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Serve Frontend Static Assets
app.use(express.static(CLIENT_DIR));

// API Routes
app.use('/api', apiRouter);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
