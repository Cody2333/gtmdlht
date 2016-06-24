var AV= require('leanengine');
var Order = AV.Object.extend('Order');
var ticketMethod = require('./ticket');
var commonRes = require('../common-response');
var router = require('express').Router();

router.post('/genTicketTest',function(req, res){
	var orderId = req.body.orderId;
	var query = new AV.Query(Order);
	query.get(orderId).then(function(order){
		return ticketMethod.createTicketP(order);
	}).then(function(){
		commonRes.simpleSuccess(res);
	},function(error){
		commonRes.unknownError(res,2,error);
	});
});

router.post('/distributeTest',function(req,res){
	var orderId = req.body.orderId;
	var query = new AV.Query(Order);
	query.get(orderId).then(function(order){
		ticketMethod.assignTicketScheduleP(order).then(function(){
			commonRes.simpleSuccess(res);
		},function(err){
			commonRes.unknownError(res,2,err);
		});
	})
});

module.exports = router;