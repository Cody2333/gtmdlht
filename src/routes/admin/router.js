var router = require('express').Router();

// var adminSign            = require('./sign');
// var adminConsoleCollege  = require('./consoleCollege');
// var adminConsoleUser     = require('./consoleUser');
// var adminConsoleOrder    = require('./consoleOrder');
// var adminConsoleRoute    = require('./consoleRoute');
// var adminConsoleCarType  = require('./consoleCarType');

// router.use('/sign', adminSign);
// router.use('/consoleCollege', adminConsoleCollege);
// router.use('/consoleUser', adminConsoleUser);
// router.use('/consoleOrder', adminConsoleOrder);
// router.use('/consoleRoute', adminConsoleRoute);
// router.use('/consoleCarType', adminConsoleCarType);

var agentRouter = require('./agent/agent-router');
var carRouter = require('./car/car-router');
var coupon = require('./coupon/coupon-router');
var locationRouter = require('./location/location-router');
var orderRouter = require('./order/order-router');
var passengerRouter = require('./passenger/passenger-router');
var routeRouter = require('./route/route-router');
var scheduleRouter = require('./schedule/schedule-router');
var ticketRouter = require('./ticket/ticket-router');
var userRouter = require('./user/user-router');
var smsRouter = require('./sms/sms');
var transactionRouter = require('./transaction/transaction-router');

router.use('/sign', require('./sign'));
router.use('/', function(req, res, next) {
	if (req.session.admin == true) {
		next();
	}
	else {
		res.send({status: 'login'});
	}
});


router.use('/agent', agentRouter);
router.use('/car', carRouter);
router.use('/coupon', coupon);
router.use('/location', locationRouter);
router.use('/order', orderRouter);
router.use('/passenger', passengerRouter);
router.use('/route', routeRouter);
router.use('/schedule', scheduleRouter);
router.use('/ticket', ticketRouter);
router.use('/user', userRouter);
router.use('/sms', smsRouter);
router.use('/transaction', transactionRouter);

module.exports = router;
