var AV = require('leanengine');
var Order = AV.Object.extend('Order');
var User = AV.User;
var Route = AV.Object.extend('Route');
var Transaction = AV.Object.extend('Transaction');
var moment = require('moment');
var routeMethods = require('../route/route');
var passengerMethods = require('../passenger/passenger');
var userMethods = require('../user/user');
var backendOrder = require('../../../backend/order/order');

function packup(order) {
	if (order == null) {
		return null;
	}
	var result = {};
	result.id = order.id;
	result.user = userMethods.packup(order.get('user'));
	result.state = order.get("state");
	result.route = routeMethods.packup(order.get("route"));
	result.orderNumber = order.get('orderNumber');
	result.createdAt = order.createdAt;
	result.createdAt = moment(order.createdAt).format('YYYY-MM-DD HH:mm:ss');
	result.price = order.get('price');
	result.priceToPay = order.get('priceToPay');
	
	return result;
}

function packupFull(order, passengers) {
	if (order == null) {
		return null;
	}
	var result = packup(order);
	result.passengers = new Array();
	for (var i = 0; i < passengers.length; i++) {
		result.passengers.push(passengerMethods.packup(passengers[i]));
	}
	return result;
}

function getOrderList(skip, limit, startTime, endTime) {
	orderQuery = new AV.Query(Order);
	if (skip != null) {
		orderQuery.skip(skip);
	}
	if (limit != null) {
		orderQuery.limit(limit);
	}
	if(startTime != null) {
		orderQuery.greaterThanOrEqualTo('createdAt', new Date(startTime));
	}
	if(endTime != null) {
		orderQuery.lessThanOrEqualTo('createdAt', new Date(endTime));
	}
	orderQuery.include('user');
	orderQuery.include('route');
	orderQuery.include('route.source');
	orderQuery.include('route.dest');
	orderQuery.include('passengers');
	orderQuery.equalTo('isDeleted', false);
	orderQuery.descending('createdAt');
	return orderQuery.find();
}

function getOrderCount(startTime, endTime) {
	orderQuery = new AV.Query(Order);
	if(startTime != null) {
		orderQuery.greaterThanOrEqualTo('createdAt', new Date(startTime));
	}
	if(endTime != null) {
		orderQuery.lessThanOrEqualTo('createdAt', new Date(endTime));
	}
	orderQuery.equalTo('isDeleted', false);
	return orderQuery.count();
}

function getOrderListByUserId(userId) {
	var orderQuery = new AV.Query(Order);
	var user = new User();
	user.id = userId;
	orderQuery.equalTo('user', user);
	orderQuery.include('user');
	orderQuery.include('route');
	orderQuery.include('route.source');
	orderQuery.include('route.dest');
	orderQuery.equalTo('isDeleted', false);
	return orderQuery.find();
}

function getOrderListByRouteId(routeId) {
	var orderQuery = new AV.Query(Order);
	var route = new Route();
	route.id = routeId;
	orderQuery.equalTo('route', route);
	orderQuery.equalTo('state', 'paid');
	orderQuery.equalTo('isDeleted', false);
	orderQuery.include('user');
	orderQuery.include('route');
	orderQuery.include('route.source');
	orderQuery.include('route.dest');
	orderQuery.include('tickets');
	orderQuery.include('tickets.passenger');
	

	orderQuery.skip(0);
	orderQuery.limit(500);
	return orderQuery.find();
}

function getOrderByOrderNumber(orderNumber) {
	var orderQuery = new AV.Query(Order);
	orderQuery.equalTo('isDeleted', false);
	orderQuery.equalTo('orderNumber', orderNumber);

	orderQuery.include('user');
	orderQuery.include('route');
	orderQuery.include('route.source');
	orderQuery.include('route.dest');
	orderQuery.include('passengers');

	return orderQuery.find();
}

function payOrder(orderId, priceToPay, otherId){
	var query = new AV.Query(Order);
	return query.get(orderId).then(function(order){
		if (order.get('state') == 'paid') {
			return AV.Promise.error('订单已经被支付');
		}
		return backendOrder.payOrderP(order);
	})
	.then(function() {
		var transaction = new Transaction();
		var order = new Order();
		order.id = orderId;
		transaction.set('amount', priceToPay);
		transaction.set('otherId', otherId);
		transaction.set('order', order);
		return transaction.save();
	});
}


exports.packup = packup;
exports.getOrderList = getOrderList;
exports.getOrderListByUserId = getOrderListByUserId;
exports.getOrderListByRouteId = getOrderListByRouteId;
exports.getOrderCount = getOrderCount;
exports.getOrderByOrderNumber = getOrderByOrderNumber;
exports.payOrder = payOrder;
