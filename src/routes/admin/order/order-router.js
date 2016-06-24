var router = require('express').Router();
var AV = require('leanengine');
var xlsx = require('node-xlsx');

var orderMethods = require('./order.js');

router.post('/list', function(req, res) {
	var orders = new Array();
	orderMethods.getOrderList(req.body.skip, req.body.limit, req.body.startTime, req.body.endTime)
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			orders.push(orderMethods.packup(results[i]));
		}
		res.send({status: "success", data: orders});
	}, function(err) {
		res.send({status: "error", data: err});
	});
});

router.post('/count', function(req, res) {
	orderMethods.getOrderCount(req.body.startTime, req.body.endTime)
	.then(function(result) {
		res.send({status: 'success', data: result});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/listByUserId', function(req, res) {
	var orders = new Array();
	orderMethods.getOrderListByUserId(req.body.userId)
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			orders.push(orderMethods.packup(results[i]));
		}
		res.send({status: "success", data: orders});
	}, function(err) {
		res.send({status:"error", data: err});
	});
});

router.post('/getByOrderNumber', function(req, res) {
	orderMethods.getOrderByOrderNumber(req.body.orderNumber)
	.then(function(results) {
		if (results.length != 1) {
			res.send({status: 'error', data: '未找到相应订单'});
		}
		else {
			res.send({status: 'success', data: orderMethods.packup(results[0])});
		}
	}, function(err) {
		res.send({status: 'error', data: err});
	})
});

router.post('/pay', function(req, res) {
	orderMethods.payOrder(req.body.id, req.body.priceToPay, req.body.otherId)
	.then(function() {
		res.send({status: 'success'});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});


router.get('/down/:startTime/:endTime', function(req, res) {
	var startTime = null;
	var endTime = null;
	var orders = new Array();
	var limit = 1000;
	var count = 0;
	var data = [['下单时间', '订单编号', '订单状态', '订单优惠前价钱（元）', '订单优惠后价钱（元）', '路线起点', '路线终点', '所属用户', '用户手机号']];
	var promise = AV.Promise.as();

	if (req.params.startTime != 'null') {
		startTime = parseFloat(req.params.startTime);
	}
	if (req.params.endTime != 'null') {
		endTime = parseFloat(req.params.endTime);
	}

	var flag = false;

	recurGet();

	function recurGet() {
		promise = promise.then(function() {
			return orderMethods.getOrderList(count * limit, limit, startTime, endTime);
		});
		promise = promise.then(function(results) {
			var promises = [];
			for (var i = 0; i < results.length; i++) {
				orders.push(orderMethods.packup(results[i]));
			}
			if (results.length == limit) {
				console.log('pp');
				count ++;
				recurGet();
			}
			else {
				flag = true;		// the data is completely catched
			}
		});
		promise = promise.then(function() {
			if (flag == true) {
				packToXlsx();

				var buffer = xlsx.build([{name: 'order data', data: data}]);
				res.attachment('data.xlsx');
				res.send(buffer);

				flag = false;
			}
		});
	}

	function packToXlsx() {
		for (var i = 0; i < orders.length; i++) {
			var result = orders[i];
			var array = [];

			array.push(result.createdAt);
			array.push(result.orderNumber);
			array.push(result.state);
			array.push(result.price / 100);
			array.push(result.priceToPay / 100);
			array.push(result.route.src.name);
			array.push(result.route.dest.name);
			array.push(result.user.name);
			array.push(result.user.phone);
			// var passengers = [];
			// for (var j = 0; j < result.passengers.length; j++) {
			// 	passengers.push(result.passengers[j].name + ': ' + result.passengers[j].phone);
			// }
			// array.push(passengers);
			data.push(array);
		}
	}
});

module.exports = router;