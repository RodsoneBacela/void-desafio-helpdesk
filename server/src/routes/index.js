const { Router } = require('express');

const transactionsRoutes = require('./transactions.routes');
const notificationsRoutes = require('./notifications.routes');
const partnerRoutes = require('./partner.routes');
const customersRoutes = require('./customers.routes');
const posRoutes = require('./pos.routes');
const appConfigRoutes = require('./appConfig.routes');
const systemRoutes = require('./system.routes');

const apiRouter = Router();

apiRouter.use('/transactions', transactionsRoutes);
apiRouter.use('/notifications', notificationsRoutes);
apiRouter.use('/partner', partnerRoutes);
apiRouter.use('/customers', customersRoutes);
apiRouter.use('/pos', posRoutes);
apiRouter.use('/app', appConfigRoutes);
apiRouter.use('/', systemRoutes);

module.exports = apiRouter;
