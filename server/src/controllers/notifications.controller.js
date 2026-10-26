const logger = require('../utils/logger');

class NotificationsController {
  // SCN-04: Queue Dispatch Unavailable (RabbitMQ 503)
  dispatchQueue(req, res) {
    const { recipient, template, forceQueueDown } = req.body || {};
    const simulateFix = req.query.simulateFix === 'true' || (forceQueueDown === false);

    if (!simulateFix) {
      logger.error('AmqpConnectionError: Channel closed by server: 404 NOT_FOUND - no queue "notifications.sms.critical" in vhost "/fidli"', {
        recipient,
        template,
        queue: 'notifications.sms.critical',
        host: 'rabbitmq-cluster.internal.fidli.net:5672'
      });

      return res.status(503).json({
        error: 'AmqpConnectionError',
        code: 'CHANNEL_CLOSED',
        replyCode: 404,
        replyText: 'NOT_FOUND - no queue "notifications.sms.critical" in vhost "/fidli"',
        message: 'Não foi possível enfileirar a mensagem de SMS no broker RabbitMQ. Canal encerrado abruptamente.',
        recipient
      });
    }

    logger.info(`Notification SMS successfully enqueued for ${recipient} (Template: ${template})`);
    return res.status(202).json({
      queued: true,
      messageId: 'msg_' + Math.random().toString(36).substr(2, 9),
      recipient,
      template,
      status: 'DISPATCHED_TO_BROKER',
      enqueuedAt: new Date().toISOString()
    });
  }
}

module.exports = new NotificationsController();
