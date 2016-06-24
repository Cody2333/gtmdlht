var router = require('express').Router();

var ensureLogin = require('./ensure-login');
var userLogin = require('./user/user-login');
var userInfo = require('./user/user-info');
var passengerRouter = require('./passenger/passenger-router');
var routeRouter = require('./route/route-router');
var orderRouter = require('./order/order-router');
var payRouter = require('./order/pay-router');

router.use('/',require('./api-time-check'));	//两次api调用时间间隔检查
router.use('/',require('./api-param-check'));	//参数检查
//router.use('/test',require('./hello-world'));
//router.use('/test',require('./ticket/test-router'));
//router.use('/test',require('./order/test-router'));
router.use('/order',payRouter);					//支付退款的api，这个是用来接收ping++结果回调的
router.use('/user',userLogin);					//用户登录注册的api
router.use('/route',routeRouter);				//查询路线的api
router.use('/area',require('./area/area-router'));
router.use('/',ensureLogin);					//用户登录检查
//router.use('/',require('./test-login'));		//下面的api需要登录状态

router.use('/user',userInfo);									//用户信息查看
router.use('/passenger',passengerRouter);						//乘客增删改查api
router.use('/order',orderRouter);								//订单增删改查api
router.use('/schedule',require('./schedule/schedule-router'));	//班次信息查看api
router.use('/coupon',require('./coupon/coupon-router'));		//优惠券信息查看api
router.use('/discode',require('./discode/discode-router'));		//优惠码查看以及使用的api
router.use('/ticket',require('./ticket/ticket-router'));		//查看票的api
router.use('/uncheckedRoute',require('./route/uncheck-router'));//查看该用户申请路线的api

module.exports = router;