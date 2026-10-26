const { Router } = require('express');
const notificationsController = require('../controllers/notifications.controller');

const router = Router();

// SCN-04: RabbitMQ Queue Channel Closed (503)
router.post('/queue-dispatch', notificationsController.dispatchQueue);

module.exports = router;
