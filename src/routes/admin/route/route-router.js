var router = require('express').Router();

var routeMethods = require('./route');
var orderMethods = require('../order/order');
var userMethods = require('../user/user');
var ticketMethods = require('../ticket/ticket');
var passengerMethods = require('../passenger/passenger');
var xlsx = require('node-xlsx');

router.post('/list', function(req, res) {
	var routes = new Array();
	routeMethods.getRouteList(req.body.skip, req.body.limit, req.body.startTime, req.body.endTime)
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			routes.push(routeMethods.packup(results[i]));
		}
		res.send({status: 'success', data: routes});
		// var promise = AV.Promise.as();
		// var j = 0;
		// for (var i = 0; i < results.length; i++) {
		// 	promise = promise.then(function() {
		// 		return orderMethods.getOrderListByRouteId(results[j].id);
		// 	});
		// 	promise = promise.then(function(orders) {
		// 		var count = 0;
		// 		for (var k = 0; k < orders.length; i++) {
		// 			count += orders[k].get('tickets').length;
		// 		}
		// 		routes.push(routeMethods.packup(results[j], count));
		// 		j++;
		// 	});
		// }
		// promise.then(function() {
		// 	res.send({status: "success", data: routes});
		// })
	}, function(err) {
		res.send({status: "error", data: err});
	});
});

router.post('/unfinishedList', function(req, res) {
	var routes = new Array();
	routeMethods.getUnfinishedRouteList(req.body.skip, req.body.limit, req.body.startTime, req.body.endTime)
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			routes.push(routeMethods.packup(results[i]));
		}
		res.send({status: 'success', data: routes});
		// var promise = AV.Promise.as();
		// var j = 0;
		// for (var i = 0; i < results.length; i++) {
		// 	promise = promise.then(function() {
		// 		return orderMethods.getOrderListByRouteId(results[j].id);
		// 	});
		// 	promise = promise.then(function(orders) {
		// 		var count = 0;
		// 		for (var k = 0; k < orders.length; i++) {
		// 			count += orders[k].get('tickets').length;
		// 		}
		// 		routes.push(routeMethods.packup(results[j], count));
		// 		j++;
		// 	});
		// }
		// promise.then(function() {
		// 	res.send({status: "success", data: routes});
		// })
	}, function(err) {
		res.send({status: "error", data: err});
	});
});

router.post('/count', function(req, res) {
	routeMethods.getRouteCount(req.body.startTime, req.body.endTime)
	.then(function(result) {
		res.send({status: 'success', data: result});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/unfinishedCount', function(req, res) {
	routeMethods.getUnfinishedRouteCount(req.body.startTime, req.body.endTime)
	.then(function(result) {
		res.send({status: 'success', data: result});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
})

router.post('/uncheckedRouteList', function(req, res) {
	var uncheckedRoutes = new Array();
	routeMethods.getUncheckedRouteList(req.body.skip, req.body.limit)
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			uncheckedRoutes.push(routeMethods.packupUncheckedRoute(results[i]));
		}
		res.send({status: 'success', data: uncheckedRoutes});
		// var promise = AV.Promise.as();
		// var j = 0;
		// for (var i = 0; i < results.length; i++) {
		// 	promise = promise.then(function() {
		// 		return userMethods.getUserById(results[j].get('user').id);
		// 	});
		// 	promise = promise.then(function(user) {
		// 		results[j].set('user', user);
		// 		uncheckedRoutes.push(routeMethods.packupUncheckedRoute(results[j]));
		// 		j++;
		// 	});
		// }
		// promise.then(function() {
		// 	res.send({status: 'success', data: uncheckedRoutes});
		// });
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/add', function(req, res) {
	routeMethods.addRoute(req.body.src, req.body.dest, req.body.srcStop, req.body.destStop,
		req.body.startTime, req.body.durationTime, req.body.price, req.body.notice)
	.then(function(result) {
		res.send({status: "success"});
	}, function(err) {
		res.send({status: "error", data: err});
	});
});

router.post('/finish', function(req, res) {
	routeMethods.finishRoute(req.body.id)
	.then(function(result) {
		res.send({status: 'success'});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/delete', function(req, res) {
	routeMethods.deleteRoute(req.body.id)
	.then(function(result) {
		res.send({status: "success"});
	}, function(err) {
		res.send({status: "error", data: err});
	});
});

router.get('/down/:routeId', function(req, res) {
	var data = [['用户ID', '乘客数量', '乘客姓名', '手机号']];
	routeId = req.params.routeId;
	var passengers = [];
	var userIds = [];
	var map = {};
	ticketMethods.getTicketListByRouteId(0, 1000, routeId)
	.then(function(results) {
		// console.log(results.length);
		for (var i = 0; i < results.length; i++) {
			passengers.push(passengerMethods.packup(results[i].get('passenger')));
			userIds.push(results[i].get('passenger').get('user').id);
		}
		// unique userId
		for (var i = 0; i < userIds.length; i++) {
			if (map[userIds[i]] == null) {
				map[userIds[i]] = {names: [passengers[i].name], phones: [passengers[i].phone]}
			}
			else {
				map[userIds[i]].names.push(passengers[i].name);
				map[userIds[i]].phones.push(passengers[i].phone);
			}
		}

		//pack to xlsx
		for (var i in map) {
			array = [];
			var nameTemp = '';
			var phoneTemp = '';
			array.push(i.substr(-6));
			array.push(map[i].names.length);
			for (var j = 0; j < map[i].names.length; j++) {
				nameTemp += map[i].names[j].substr(0, 1);
				nameTemp += '同学';
				nameTemp += ',';
				phoneTemp += map[i].phones[j].substr(0, 3);
				phoneTemp += '*****';
				phoneTemp += map[i].phones[j].substr(7, 4);
				phoneTemp += ',';
			}
			array.push(nameTemp);
			array.push(phoneTemp);
			data.push(array);
		}
		
		// build data as attachment back to browser
		var buffer = xlsx.build([{name: 'order data', data: data}]);
		res.attachment('data.xlsx');
		res.send(buffer);
	});
});

module.exports = router;