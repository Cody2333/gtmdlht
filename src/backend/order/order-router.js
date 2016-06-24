var AV = require('leanengine');
var router = require('express').Router();
var orderMethod = require('./order');
var Order = AV.Object.extend('Order');
var Passenger = AV.Object.extend('Passenger');
var Coupon = AV.Object.extend('Coupon');
var Route = AV.Object.extend('Route');
var commonRes = require('../common-response')

/*创建新订单
params	:routeId,passengersId(array),couponsId(array)
send	:{
			err,
			ret:order
		}
 */
router.post('/create', function (req, res) {
	var user = req.AV.user;
	var routeId = req.body.routeId;
	var passengersId = req.body.passengersId;
	var couponsId = req.body.couponsId;
	if (couponsId == null) {
		couponsId = [];
	}
	if (typeof passengersId === 'string') {
		passengersId = JSON.parse(passengersId);
	}
	if (typeof couponsId === 'string') {
		couponsId = JSON.parse(couponsId);
	}
	var passengers = [];
	var coupons = [];
	var route;
	var promise = AV.Promise.as();
	promise = promise.then(function () {
		var psPromises = [];
		passengersId.forEach(function (passengerId) {
			var query = new AV.Query(Passenger);
			psPromises.push(query.get(passengerId));
		});
		return AV.Promise.all(psPromises);
	});
	promise = promise.then(function (results) {
		passengers = results;
	});
	promise = promise.then(function () {
		var cpPromises = [];
		couponsId.forEach(function (couponId) {
			var query = new AV.Query(Coupon);
			query.include('discountRule');
			query.include('validSource');
			query.include('validDest');
			cpPromises.push(query.get(couponId));
		});
		return AV.Promise.all(cpPromises);
	});
	promise = promise.then(function (results) {
		coupons = results;
	})
	promise = promise.then(function () {
		var query = new AV.Query(Route);
		query.include('source');
		query.include('dest');
		return query.get(routeId);
	});
	promise = promise.then(function (result) {
		route = result;
	});
	promise = promise.then(function () {
		return orderMethod.createOrderP(user, passengers, route, coupons);
	});
	promise = promise.then(function (result) {
		res.json({
			err: {
				code: 0,
				des: ""
			},
			ret: {
				order: orderMethod.avOrderInfoToFrontOrderInfo(result.order, result.passengers, result.coupons)
			}
		});
	}, function (error) {
		commonRes.unknownError(res, 2, error);
	});
});

/*计算订单价格，但是不生成订单
params	:routeId,passengersId(array),couponsId(array)
send	:{
			err,
			ret:price
		}
 */
router.post('/countPrice', function (req, res) {
	var routeId = req.body.routeId;
	var passengersId = req.body.passengersId;
	var couponsId = req.body.couponsId;
	if (couponsId == null) {
		couponsId = [];
	}
	if (typeof passengersId === 'string' || passengersId instanceof String) {
		passengersId = JSON.parse(passengersId);
	}
	if (typeof couponsId === 'string' || couponsId instanceof String) {
		couponsId = JSON.parse(couponsId);
	}
	var passengers = [];
	var coupons = [];
	var route;
	var promise = AV.Promise.as();
	promise = promise.then(function () {
		var psPromises = [];
		passengersId.forEach(function (passengerId) {
			var query = new AV.Query(Passenger);
			psPromises.push(query.get(passengerId));
		});
		return AV.Promise.all(psPromises);
	});
	promise = promise.then(function (results) {
		passengers = results;
	});
	promise = promise.then(function () {
		var cpPromises = [];
		couponsId.forEach(function (couponId) {
			var query = new AV.Query(Coupon);
			query.include('discountRule');
			query.include('validSource');
			query.include('validDest');
			cpPromises.push(query.get(couponId));
		});
		return AV.Promise.all(cpPromises);
	});
	promise = promise.then(function (results) {
		coupons = results;
	});
	promise = promise.then(function () {
		var query = new AV.Query(Route);
		query.include('source');
		query.include('dest');
		return query.get(routeId);
	});
	promise = promise.then(function (result) {
		route = result;
		var price = passengers.length * route.get('price');
		if (!orderMethod.checkCouponValidForOrder(route, price, coupons)) {
			return AV.Promise.error('优惠券无效');
		} else {
			var finalPrice = orderMethod.countFinalPrice(price, coupons);
			res.json({
				err: {
					code: 0,
					des: ""
				},
				ret: {
					price: finalPrice
				}
			});
		}
	});
	promise.catch(function (err) {
		commonRes.unknownError(res, 2, err);
	});
});

/*列出用户的订单列表
send	:{
			err,
			ret:orders(array)
		}
*/
router.post('/list', function (req, res) {
	var user = req.AV.user;
	var skip = req.body.skip;
	var limit = req.body.limit;
	var state = req.body.state;
	orderMethod.listOrdersP(user, skip, limit, state).then(function (orders) {
		res.json({
			err: {
				code: 0,
				des: ""
			},
			ret: {
				orders: orderMethod.avOrderListToFrontOrderList(orders)
			}
		});
	}, function (error) {
		commonRes.unknownError(res, 2, error);
	});
});

/*向订单中增加优惠券,重新计算订单价格
params	:orderId,couponsId(array)
send	:{
			err,
			ret:order
		}
*/
router.post('/addCoupons', function (req, res) {
	var orderId = req.body.orderId;
	var couponsId = req.body.couponsId;
	if (typeof couponsId === 'string' || couponsId instanceof String) {
		couponsId = JSON.parse(couponsId);
	}
	var coupons = [];
	var promise = AV.Promise.as();
	promise = promise.then(function () {
		var cpPromises = [];
		couponsId.forEach(function (couponId) {
			var query = new AV.Query(Coupon);
			query.include('discountRule');
			query.include('validSource');
			query.include('validDest');
			cpPromises.push(query.get(couponId));
		});
		return AV.Promise.all(cpPromises);
	});
	promise = promise.then(function (results) {
		coupons = results;
	});
	promise.then(function () {
		var query = new AV.Query(Order);
		query.include(['route.source','route.dest']);
		return query.get(orderId);
	}).then(function (order) {
		return orderMethod.addCouponsP(order, coupons);
	}).then(function (result) {
		res.json(orderMethod.avOrderInfoToFrontOrderInfo(result.order, result.passengers, result.coupons));
	}, function (error) {
		commonRes.unknownError(res, 2, error);
	});
});

/*移除订单中的优惠券，重新计算价格
params	:orderId,couponsId(array)
send	:{
			err,
			ret:order
		}
 */
router.post('/removeCoupons', function (req, res) {
	var orderId = req.body.orderId;
	var couponsId = req.body.couponsId;
	if (typeof couponsId === 'string' || couponsId instanceof String) {
		couponsId = JSON.parse(couponsId);
	}
	var coupons = [];
	var promise = AV.Promise.as();
	promise = promise.then(function () {
		var cpPromises = [];
		couponsId.forEach(function (couponId) {
			var query = new AV.Query(Coupon);
			query.include('discountRule');
			query.include('validSource');
			query.include('validDest');
			cpPromises.push(query.get(couponId));
		});
		return AV.Promise.all(cpPromises);
	});
	promise = promise.then(function (results) {
		coupons = results;
	});
	promise.then(function () {
		var query = new AV.Query(Order);
		query.include(['route.source','route.dest']);
		return query.get(orderId);
	}).then(function (order) {
		return orderMethod.removeCouponsP(order, coupons);
	}).then(function (result) {
		res.json(orderMethod.avOrderInfoToFrontOrderInfo(result.order, result.passengers, result.coupons));
	}, function (error) {
		commonRes.unknownError(res, 2, error);
	});
});

//查看订单详细信息
router.post('/view', function (req, res) {
	var orderId = req.body.orderId;
	orderMethod.getOrderP(orderId).then(function (result) {
		res.json({
			err: {
				code: 0,
				des: ""
			},
			ret: {
				order: orderMethod.avOrderInfoToFrontOrderInfo(result.order, result.passengers, result.coupons, result.tickets, result.transactions)
			}
		});
	}, function (error) {
		commonRes.unknownError(res, 2, error);
	});
});

//取消订单，若订单未支付，则直接取消，若订单已支付，则发起退款请求
router.post('/cancel', function (req, res) {
	var id = req.body.orderId;
	orderMethod.cancelOrderP(id).then(function () {
		commonRes.simpleSuccess(res);
	}, function (error) {
		commonRes.unknownError(res, 2, error);
	})
})

module.exports = router;