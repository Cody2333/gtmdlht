var AV = require('leanengine');
var Order = AV.Object.extend('Order');
var router = require('express').Router();
var orderMethod = require('./order');
var commonRes = require('../common-response');
router.post('/testPay',function(req,res){
	var orderId = req.body.orderId;
	var query = new AV.Query(Order);
	query.include('route');
	query.get(orderId).then(function(order){
		orderMethod.payOrderP(order).then(function(){
			commonRes.simpleSuccess(res);
		},function(err){
			commonRes.unknownError(res,2,err);
		});
	});
});

router.post('/testClearOrder',function(req,res){
	orderMethod.deleteTimeOutOrderP().then(function(){
		commonRes.simpleSuccess(res);
	},function(err){
		commonRes.unknownError(res,2,err);
	})
});

router.post('/testCancelOrder',function(req,res){
	var orderId = req.body.orderId;
	orderMethod.cancelOrderP(orderId).then(function(){
		commonRes.simpleSuccess(res);
	},function(error){
		commonRes.unknownError(res,2,error);
	})
})

module.exports = router;