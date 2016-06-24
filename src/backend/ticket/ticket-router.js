var AV= require('leanengine');
var ticketMethod = require('./ticket');
var commonRes = require('../common-response');
var router = require('express').Router();

/*列出指定订单的车票
params	:orderId
send	:{
			err,
			ret : tickets(array)[Apidoc中的格式]
		}
*/
router.post('/listByOrder',function(req,res){
	var orderId = req.body.orderId;
	ticketMethod.listByOrderP(orderId).then(function(results){
		res.json({
			err : {
				code : 0,
				des : ""
			},
			ret : {
				tickets : ticketMethod.avTicketToFrontTicket(results)
			}
		});
	},function(error){
		commonRes.unknownError(res,2,error);
	});
});

/*列出指定手机号的车票
params	:phone
send	:{
			err,
			ret : tickets(array)[Apidoc中的格式]
		}
*/
router.post('/listByPhone',function(req,res){
	var phone = req.AV.user.get('mobilePhoneNumber');
	ticketMethod.listByPhoneP(phone).then(function(results){
		res.json({
			err : {
				code : 0,
				des : ""
			},
			ret : {
				tickets : ticketMethod.avTicketToFrontTicket(results)
			}
		});
	},function(error){
		commonRes.unknownError(res,2,error);
	});
});

/*列出用户账号内的车票
send	:{
			err,
			ret : tickets(array)[Apidoc中的格式]
		}
*/
router.post('/listByUser',function(req,res){
	var user = req.AV.user;
	ticketMethod.listByUserP(user).then(function(results){
		res.json({
			err : {
				code : 0,
				des : ""
			},
			ret : {
				tickets : results
			}
		});
	},function(error){
		commonRes.unknownError(res,2,error);
	});
});

/*查询指定车票的详细信息（订单，班次，路线）
params	:ticketId
send	:{
			err,
			ret : tickets(array)[Apidoc中的格式]
		}
*/
router.post('/info',function(req,res){
	var id = req.body.ticketId;
	ticketMethod.ticketInfoP(id).then(function(ticket){
		var tickets = [];
		tickets.push(ticket);
		res.json({
			err : {
				code : 0,
				des : ""
			},
			ret : {
				tickets : ticketMethod.avTicketToFrontTicket(tickets)
			}
		});
	},function(error){
		commonRes.unknownError(res,2,error);
	});
});

//使用车票（检票用）
router.post('/use',function(req,res){
	var id = req.body.ticketId;
	ticketMethod.useTicketP(id).then(function(){
		commonRes.simpleSuccess(res);
	},function(error){
		commonRes.unknownError(res,2,error);
	});
});


module.exports = router;
