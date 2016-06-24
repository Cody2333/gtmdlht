var router = require('express').Router();
var ticketMethods = require('./ticket');
var orderMethods = require('../order/order');
var scheduleMethods = require('../schedule/schedule');

router.post('/listByScheduleId', function(req, res) {
	var tickets = new Array();
	ticketMethods.getTicketListByScheduleId(req.body.id)
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			tickets.push(ticketMethods.packup(results[i]));
		}
		res.send({status: 'success', data: tickets});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/listByRouteId', function(req, res) {
	var tickets = new Array();
	// orderMethods.getOrderListByRouteId(req.body.id)
	// .then(function(results) {
	// 	for (var i = 0; i < results.length; i++) {
	// 		for (var j = 0; j < results[i].tickets.length; j++) {
	// 			tickets.push(ticketMethods.packup(results[i].tickets[j]));
	// 		}
	// 	}
	// 	res.send({status: 'success', data: tickets});
	// });
	ticketMethods.getTicketListByRouteId(req.body.skip, req.body.limit, req.body.id)
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			tickets.push(ticketMethods.packup(results[i]));
		}
		res.send({status: 'success', data: tickets});
	}, function(err) {
		res.send({status: 'error', data: err});
	});

	// ticketMethods.getTicketListByRouteId(req.body.id)
	// .then(function(results) {
	// 	for (var i = 0; i < results.length; i++) {
	// 		tickets.push(ticketMethods.packup(results[i]));
	// 	}
	// 	res.send({status: 'success', data: tickets});
	// }, function(err) {
	// 	res.send({status: 'error', data: err});
	// });
});

router.post('/autoDistribute', function(req, res) {
	ticketMethods.autoDistribute(req.body.id)
	.then(function() {
		res.send({status: 'success'});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});
// router.post('/autoDistribute', function(req, res) {
// 	var tickets = new Array();
// 	var schedules = new Array();
// 	var promise = AV.Promise.as();
// 	promise = ticketMethods.getTicketListByRouteId(0, 1000, req.body.id);
// 	promise = promise.then(function(results) {
// 		for (var i = 0; i < results.length; i++) {
// 			tickets.push(results[i]);
// 		}
// 		return scheduleMethods.getScheduleListByRouteId(req.body.id);
// 	});
// 	promise = promise.then(function(results) {
// 		for (var i = 0; i < results.length; i++) {
// 			schedules.push(results[i]);
// 		}
// 	});
// 	promise = promise.then(function() {
// 		var count = 1;
// 		var preIndex = 0;
// 		var preOrderId = "";
// 		for (var i = 0; i < tickets.length; i++) {
// 			if (i = 0) {
// 				preOrderId = tickets[i].get('order').id;
// 				continue;
// 			}
// 			if (tickets[i].get('order').id == preOrderId) {
// 				count ++;
// 			}
// 			if (tickets[i].get('order').id != preOrderId || i == tickets.length - 1) {
// 				var flag = 0;
// 				for (var j = 0; j < schedules.length; j++) {
// 					if (schedules[j].get('takenSeat') + count <= schedules[j].get('totalSeat')) {
// 						for (var k = 0; k < count; k++) {
// 							ticketMethods.setSchedule(tickets[k+preIndex].id, schedules[j].id);
// 							scheduleMethods.increaseSeat(schedules[j].id);
// 							schedules[j].set('takenSeat', schedules[j].get('takenSeat'));
// 						}
// 						preOrderId = tickets[i].get('order').id;
// 						preIndex = i;
// 						count = 1;
// 						flag = 1;	// to truge if is completed
// 						break;
// 					}
// 				}
// 				if (flag == 0) {
// 					for (var j = 0; j < count; j++) {
// 						for (var k = 0; k < schedules.length; k++) {
// 							if (schedules[k].get('takenSeat') < schedules[k].get('totalSeat')) {
// 								ticketMethods.setSchedule(tickets[j+preIndex].id, schedules[k].id);
// 								scheduleMethods.increaseSeat(schedules[k].id);
// 								schedules[k].set('takenSeat', schedules[k].get('takenSeat'));
// 								break;
// 							}
// 						}
// 					}
// 					preOrderId = tickets[i].get('order').id;
// 					preIndex = i;
// 					count = 1;
// 				}
// 			}
// 		}
// 	});
// 	promise.then(function() {
// 		res.send({status: 'success'});
// 	}, function(err) {
// 		res.send({status: 'error', data: err});
// 	});
// });

module.exports = router;