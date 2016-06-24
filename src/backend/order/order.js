var AV = require('leanengine');
var Order = AV.Object.extend('Order');
var Passenger = AV.Object.extend('Passenger');
var Coupon = AV.Object.extend('Coupon');
var Route = AV.Object.extend('Route');
var Schedule = AV.Object.extend('Schedule');
var Transaction = AV.Object.extend('Transaction');
var TransactionQuery = AV.Object.extend('TransactionQuery');
var Ticket = AV.Object.extend('Ticket');

var vm = require('vm');
var smsMethod = require('../sms/sms');
var couponMethod = require('../coupon/coupon');
var routeMethod = require('../route/route');
var ticketMethod = require('../ticket/ticket');
var transactionMethod = require('../transaction/transaction');
var passengerMethod = require('../passenger/passenger');
var moment = require('moment');
var timeLine = require('../time-line');

//延迟函数，相当于sleep
function timerPromisefy(delay) {
    return new AV.Promise(function (resolve) {
		//延迟 delay 毫秒，然后调用 resolve
		setTimeout(function () {
			resolve(delay);
		}, delay);
	});
};
  
  
//将订单详细信息整合为详细信息
function avOrderInfoToFrontOrderInfo(order, passengers, coupons, tickets, transactions) {
	var route = [];
	route.push(order.get('route'));
	return {
		id: order.id,
		userId: order.get('user').id,
		state: order.get('state'),
		orderNumber: order.get('orderNumber'),
		route: routeMethod.avRouteToFrontRoute(route)[0],
		passengers: passengerMethod.avpassengersToFrontArray(passengers),
		coupons: couponMethod.avCouponToFrontCoupon(coupons),
		tickets: ticketMethod.avTicketToFrontTicket(tickets),
		transactions: transactionMethod.avTransactionToFrontTransaction(transactions),
		price: order.get('price'),
		priceToPay: order.get('priceToPay'),
		createAt: order.get('creatAt')
	};
}

//将数据库中的订单信息转换为前端的格式
function avOrderListToFrontOrderList(orders) {
	if (orders == null) {
		return null;
	}
	var results = [];
	for (var i = 0; i < orders.length; i++) {
		var route = [];
		route.push(orders[i].get('route'));
		results.push({
			id: orders[i].id,
			userId: orders[i].get('user').id,
			orderNumber: orders[i].get('orderNumber'),
			route: routeMethod.avRouteToFrontRoute(route)[0],
			state: orders[i].get('state'),
			price: orders[i].get('price'),
			priceToPay: orders[i].get('priceToPay'),
			createAt: orders[i].get('creatAt')
		});
	}
	return results;
}

//快速查询订单详细信息
function getOrderFastP(orderId) {
	var order = null;
	var coupons = null;
	var passengers = null;
	var tickets = null;
	var transactions = null;
	var query = new AV.Query(Order);
	query.include(["route.source", "route.dest"]);
	return query.get(orderId).then(function (result) {
		order = result;
		var promises = [];
		promises.push(order.relation('coupons').query().find());
		promises.push(order.relation('passengers').query().find());
		var ticketQ = order.relation('tickets').query();
		ticketQ.include('schedule');
		promises.push(ticketQ.find());
		var transactionQ = new AV.Query(Transaction);
		transactionQ.equalTo('order', order);
		promises.push(transactionQ.find());
		return AV.Promise.when(promises).then(function (couponsR, passengersR, ticketsR, transactionsR) {
			coupons = couponsR;
			passengers = passengersR;
			tickets = ticketsR;
			transactions = transactionsR;
			return new AV.Promise(function (resolve, reject) {
				resolve({
					order: order,
					passengers: passengers,
					coupons: coupons,
					tickets: tickets,
					transactions: transactions
				});
			});
		});
	});
}

function getOrderP(orderId) {
	var order = null;
	var coupons = null;
	var passengers = null;
	var tickets = null;
	var transactions = null;
	var query = new AV.Query(Order);
	query.include(["route.source", "route.dest"]);
	return query.get(orderId).then(function (result) {
		order = result;
		if(order.get('isDeleted')){
			return AV.Promise.error('该订单已删除');
		}
		return order.relation('coupons').query().find();
	}).then(function (results) {
		coupons = results;
		return order.relation('passengers').query().find();
	}).then(function (results) {
		passengers = results;
		var promise = AV.Promise.as();
		if (order.get('state') != 'unpay' && order.get('state') != 'paying') {
			promise = promise.then(function () {
				var query = new AV.Query(Transaction);
				query.equalTo('order', order);
				return query.find();
			}).then(function (results) {
				transactions = results;
			});
			if (order.get('state') != 'cancelling' && order.get('state') != 'cancelled') {
				promise = promise.then(function () {
					var query = order.relation('tickets').query();
					query.include('schedule');
					return query.find();
				}).then(function (results) {
					tickets = results;
				});
			}
		}
		return promise.then(function () {
			return new AV.Promise(function (resolve, reject) {
				resolve({
					order: order,
					passengers: passengers,
					coupons: coupons,
					tickets: tickets,
					transactions: transactions
				});
			});
		});
	});
}

//计算代理提成
function countAgentCommission(price, agent) {
	var commissionFunction = agent.get('agentInfo').get('agentCommissionRule').get('commissionFunction');
	var sandbox = {
		finalPrice: 0
	};
	vm.runInNewContext('finalPrice = (' + commissionFunction + ')(' + price + ',' + agent.get('agentInfo').get('preliveConsumer') + ');', sandbox);
	return parseInt(sandbox.finalPrice);
}


//计算折扣后的价格，coupons默认能在此order使用, 默认coupons含有discountRule
function countFinalPrice(price, coupons) {
	var discountFun;
	var sandbox = {
		finalPrice: price
	};
	for (var i = 0; i < coupons.length; i++) {
		discountFun = coupons[i].get('discountRule').get('discountFunction');
		if (discountFun != null) {
			vm.runInNewContext("finalPrice = (" + discountFun + ")(finalPrice," + coupons[i].get('discountPrice') + ");", sandbox);
		}
	}
	return parseInt(sandbox.finalPrice);
}


/*coupons的拦截器，判断coupons是否适用于此order，默认coupons含有discountRule
params	:route(object),price(number),coupons(array)
return	:true|false
*/
function checkCouponValidForOrder(route, price, coupons) {
	var isCouponOk = true;
	var isCodeCoupon = false;
	var isRefundCoupon = false;
	for (var i = 0; i < coupons.length; i++) {
		if (!couponMethod.checkCouponInTime(coupons[i])) {
			isCouponOk = false;
			break;
		}
		if (coupons[i].get('order') != null) {
			isCouponOk = false;
			break;
		}
		if (coupons[i].get('validPrice') > price) {
			isCouponOk = false;
			break;
		}
		if (coupons[i].get('validSource') != null) {
			if (coupons[i].get('validSource').get('area').id != route.get('source').get('area').id) {
				isCouponOk = false;
				break;
			}
		}
		if (coupons[i].get('validDest') != null) {
			if (coupons[i].get('validDest').get('area').id != route.get('dest').get('area').id) {
				isCouponOk = false;
				break;
			}
		}
		if (coupons[i].get('type') == 'user' || coupons[i].get('type') == 'agent' || coupons[i].get('type') == 'public') {
			if (isCodeCoupon) {
				isCouponOk = false;
				break;
			} else {
				isCodeCoupon = true;
			}
		}
		if (coupons[i].get('type') == 'refund') {
			if (isRefundCoupon) {
				isCouponOk = false;
				break;
			} else {
				isRefundCoupon = true;
			}
		}
	}
	return isCouponOk;
}

//生成订单号--时间戳
function genOrderNumber() {
	var code = moment().format('YYYYMMDDHHmmssSS');
	for (var i = 0; i < 2; i++) {
		code += parseInt(Math.random() * 10).toString();
	}
	return code;
}

/*创建订单，首先检查路线是否有效，再检查是否已过买票时间，再检查优惠券是否有效，最后检查路线人数是否已满
params	:user,passengers(array),route(object),coupons(array)
return	:AV.Promise
*/
function createOrderP(user, passengers, route, coupons) {
	//如果优惠券为空，则转化成空数组
	if (coupons == null) {
		coupons = [];
	}
	var startTime = route.get('startTime');
	var query;
	var price = route.get('price') * passengers.length;
	if (route.get('isDeleted')) {
		return AV.Promise.error('路线已删除');
	}
	if (moment().add(timeLine.buyDeadline, 'ms').isAfter(startTime)) {
		return AV.Promise.error('过了买票时间');
	}
	if (checkCouponValidForOrder(route, price, coupons) == false) {
		return AV.Promise.error('已使用同类优惠券,或者优惠券无效');
	}
	if (passengers.length > 4) {
		return AV.Promise.error('乘客人数超过上限');
	}
	if (moment().add(timeLine.addBusDeadline).isAfter(startTime)) {
		query = new AV.Query(Schedule);
		query.equalTo('route', route);
		query.equalTo('isDeleted', false);
		return query.find().then(function (results) {
			var totalSeats = 0;
			for (var i = 0; i < results.length; i++) {
				totalSeats += results[i].get('totalSeat');
			}
			if (totalSeats < (route.get('passengerNumber') + passengers.length)) {
				return AV.Promise.error('该路线人数已满');
			}
			var promise = AV.Promise.as();
			promise = promise.then(function () {
				route.increment('passengerNumber', passengers.length);
				route.fetchWhenSave(true);
				return route.save();
			});
			promise = promise.then(function (route) {
				if (route.get('passengerNumber') > totalSeats) {
					route.increment('passengerNumber', -passengers.length);
					route.save();
					return AV.Promise.error('该路线人数已满');
				}
				var order = new Order();
				order.set('user', user);
				order.set('route', route);
				order.relation('passengers').add(passengers);
				if (coupons.length != 0) {
					order.relation('coupons').add(coupons);
				}
				order.set('orderNumber', genOrderNumber());
				order.set('price', price);
				order.set('isDeleted', false);
				order.set('state', 'unpay');
				order.fetchWhenSave(true);
				order.set('priceToPay', countFinalPrice(price, coupons)); //计算折扣后的价格
				return order.save();
			})
			promise = promise.then(function (newOrder) {
				var promises = [];
				coupons.forEach(function (coupon) {
					coupon.set('order', newOrder);
					coupon.set('isUsed', true);
					promises.push(coupon.save());
				});
				var promise = AV.Promise.all(promises);
				return promise.then(function () {
					return new AV.Promise(function (resolve, reject) {
						resolve({
							order: newOrder,
							passengers: passengers,
							coupons: coupons
						});
					});
				});
			});
			return promise;
		});
	}
	else {
		var promise = AV.Promise.as();
		promise = promise.then(function () {
			route.increment('passengerNumber', passengers.length);
			return route.save();
		});
		promise = promise.then(function () {
			var order = new Order();
			order.set('user', user);
			order.set('route', route);
			order.relation('passengers').add(passengers);
			if (coupons.length != 0) {
				order.relation('coupons').add(coupons);
			}
			order.set('orderNumber', genOrderNumber());
			order.set('price', price);
			order.set('isDeleted', false);
			order.set('state', 'unpay');
			order.fetchWhenSave(true);
			order.set('priceToPay', countFinalPrice(price, coupons)); //计算折扣后的价格
			return order.save();
		});
		promise = promise.then(function (newOrder) {
			var promises = [];
			coupons.forEach(function (coupon) {
				coupon.set('order', newOrder);
				promises.push(coupon.save());
			});
			var promise = AV.Promise.all(promises);
			return promise.then(function (coupons) {
				return new AV.Promise(function (resolve, reject) {
					resolve({
						order: newOrder,
						passengers: passengers,
						coupons: coupons
					});
				});
			});
		});
		return promise;
	}
}


//向订单中添加优惠券
function addCouponsP(order, coupons) {
	var totalCoupons = coupons;
	//检查订单是否已付款
	if (order.get('state') != 'unpay') {
		return AV.Promise.error('订单正在支付或者已支付');
	}
	var couponQ = order.relation('coupons').query();
	couponQ.include('discountRule');
	return couponQ.find().then(function (results) {
		for (var i = 0; i < results.length; i++) {
			totalCoupons.push(results[i]);
		}
		var route = order.get('route');
		return route.fetch().then(function (route) {
			if (!checkCouponValidForOrder(route, order.get('price'), totalCoupons)) {
				return AV.Promise.error('已使用同类优惠券,或者优惠券无效');
			}
			//将coupon加入order
			if (coupons.length != 0) {
				order.relation('coupons').add(coupons);
			}
			order.fetchWhenSave(true);
			//重新计算价格
			order.set('priceToPay', countFinalPrice(order.get('price'), totalCoupons)); //计算折扣后的价格
			var promise = order.save();
			return promise.then(function (newOrder) {
				var promise = AV.Promise.as();
				var index = 0;
				for (var i = 0; i < coupons.length; i++) {
					promise = promise.then(function () {
						coupons[index].set('order', newOrder);
						coupons[index].set('isUsed', true);
						index++;
						return coupons[index - 1].save();
					});
				}
				return promise.then(function () {
					return newOrder.relation('passengers').query().find();
				}).then(function (passengers) {
					return new AV.Promise(function (resolve, reject) {
						resolve({
							order: newOrder,
							passengers: passengers,
							coupons: totalCoupons
						});
					});
				});
			});
		});
	});
}

//移除订单中的优惠券
function removeCouponsP(order, coupons) {
	var finalCoupons;
	if (order.get('state') != 'unpay') {
		return AV.Promise.error('订单正在支付中或者已支付');
	}
	if (coupons.length != 0) {
		order.relation('coupons').remove(coupons);
	}
	return order.save().then(function (order) {
		var promise = AV.Promise.as();
		var index = 0;
		for (var i = 0; i < coupons.length; i++) {
			promise = promise.then(function () {
				coupons[index].set('order', null);
				coupons[index].set('isUsed', false);
				index++;
				return coupons[index - 1].save();
			});
		}
		return promise;
	}).then(function () {
		var couponQ = order.relation('coupons').query();
		couponQ.include('discountRule');
		return couponQ.find();
	}).then(function (results) {
		finalCoupons = results;
		order.set('priceToPay', countFinalPrice(order.get('price'), finalCoupons)); //计算折扣后的价格
		return order.save();
	}).then(function () {
		return order.relation('passengers').query().find();
	}).then(function (passengers) {
		return new AV.Promise(function (resolve, reject) {
			resolve({
				order: order,
				passengers: passengers,
				coupons: finalCoupons
			})
		});
	});
}

function listOrdersP(user, skip, limit, state) {
	var query = new AV.Query(Order);
	query.equalTo('user', user);
	query.equalTo('isDeleted', false);
	query.descending('createdAt');
	query.include(["route.source", "route.dest"]);
	if (skip != null) {
		query.skip(skip);
	}
	if (limit != null) {
		query.limit(limit);
	}
	if (state != null) {
		query.equalTo(state);
	}
	return query.find();
}

//删除过期未支付订单
function deleteTimeOutOrderP() {
	var query = new AV.Query(Order);
	var routesToUpdate = [];
	query.equalTo('isDeleted', false);
	query.equalTo('state', 'unpay');
	query.include('route');
	return query.find().then(function (orders) {
		if (orders.length != 0) {
			console.log('查找到订单数 ：' + orders.length);
		}
		var now = moment();
		var promises = [];
		orders.forEach(function (order) {
			if ((moment(order.createdAt).add(10, 'm')).isBefore(now)) {
				var promise = order.relation('coupons').query().find();
				promise = promise.then(function (coupons) {
					coupons.forEach(function (coupon) {
						coupon.set('order', null);
					});
					if (coupons.length != 0) {
						order.relation('coupons').remove(coupons);
					}
					order.set('isDeleted', true);
					return order.save();
				});
				promises.push(promise);
				console.log('删除订单:' + order.id);
				console.log(order.createdAt);
				//将路线加入待更新路线数组中，剔除重复的
				var contain = false;
				for(var i =0;i<routesToUpdate.length;i++){
					if(routesToUpdate[i].id == order.get('route').id){
						contain = true;
						break;
					}
				}
				if(!contain){
					routesToUpdate.push(order.get('route'));
				}
			}
		});
        timerPromisefy(10000).then(function(){
            //更新各路线人数
            routesToUpdate.forEach(function(route){
                routeMethod.recountPassengerNumber(route);
            });
        })
		return AV.Promise.all(promises);
	});
}

//取消订单，如果没有支付就直接删除，如果支付了就发起支付请求
function cancelOrderP(orderId) {
	var query = new AV.Query(Order);
	var route, order, tickets;
	query.include('route');
	return query.get(orderId).then(function (result) {
		order = result;
		if (order.get('isDeleted') == true || order.get('state') == 'cancelled') {
			return AV.Promise.error('该订单已取消');
		}
		if (order.get('state') == 'cancelling') {
			return AV.Promise.error('正在退款中，请耐心等待');
		}
		route = order.get('route');
		if (order.get('state') == 'unpay' || order.get('state') == 'paying') {
			var cpQuery = order.relation('coupons').query();
			var psQuery = order.relation('passengers').query();
			var promises = [];
			var cpPromise = cpQuery.find().then(function (coupons) {
				coupons.forEach(function(coupon){
					coupon.set('order',null);
					coupon.set('isUsed',false);
					coupon.save();
				});
			});
			var psPromise = psQuery.count().then(function (count) {
				route.increment('passengerNumber', -count);
				return route.save();
			})
			promises.push(cpPromise);
			promises.push(psPromise);
			order.set('isDeleted', true);
			promises.push(order.save());
			return AV.Promise.all(promises);
		} else if (order.get('state') == 'paid') {
			if (moment().add(timeLine.refundDeadline, 'ms').isAfter(route.get('startTime'))) {
				return AV.Promise.error('发车前' + timeLine.refundDeadline / 3600000 + '小时不允许退款');
			}
			order.set('state', 'cancelling');
			return order.save().then(function () {
				var query = new AV.Query(Transaction);
				query.equalTo('order', order);
				return query.find();
			}).then(function (result) {
				if (result.length == 0) {
					return AV.Promise.error('找不到支付记录');
				}
				var trQuery = new TransactionQuery();
				trQuery.set('user', order.get('user'));
				trQuery.set('type', 'refund');
				trQuery.set('state', 'untreated');
				trQuery.set('order', order);
				trQuery.set('amount', order.get('priceToPay'));
				trQuery.set('chargeId', result[0].get('chargeId'));
				trQuery.set('channel', result[0].get('channel'));
				trQuery.set('currency', result[0].get('currency'));
				trQuery.set('isDeleted', false);
				trQuery.save();
				var query = order.relation('tickets').query();
				query.include('schedule');
				return query.find();
			}).then(function (results) {
				//将路线乘客数量减去订单里的乘客数量
				tickets = results;
				order.relation('passengers').query().count().then(function(count){
					route.increment('passengerNumber', -count);
					route.save();
				})
				var promises = [];
				tickets.forEach(function (ticket) {
					var schedule = ticket.get('schedule');
					if (schedule != null) {
						schedule.increment('takenSeat', -1);
						promises.push(schedule.save());
					}
					ticket.set('isDeleted', true);
					ticket.set('state', 'discard');
					promises.push(ticket.save());
				});
				return AV.Promise.all(promises);
			});
		}
	});
}

function payOrderP(order) {
	var promise = AV.Promise.as();
	if (order.get('state') == 'paid') {
		return AV.Promise.error('订单已支付');
	}
	order.set('state', 'paid');
	if (order.get('isDeleted')) {
		var route = order.get('route');
		order.relation('passengers').query().count().then(function (count) {
			route.increment('passengerNumber', count);
			route.save();
		});
		order.set('isDeleted', false);
	}
	promise = promise.then(function () {
		return order.save();
	});
	promise = promise.then(function () {
		var query = new AV.Query(AV.User);
		query.include(['myAgent.agentInfo.agentCommissionRule']);
		return query.get(order.get('user').id);
	});
	promise = promise.then(function (user) {
		if (user.get('myAgent') != null) {
			order.relation('passengers').query().count().then(function (count) {
				var agentInfo = user.get('myAgent').get('agentInfo');
				agentInfo.increment('liveConsumer', count);
				agentInfo.save();
			});
			var agent = user.get('myAgent');
			var commission = countAgentCommission(order.get('priceToPay'), agent);
			agent.increment('balance', commission);
			agent.save();
		}
	});
	promise = promise.then(function () {
		return order.relation('coupons').query().find();
	});
	//设置对应的优惠券为使用过
	promise = promise.then(function (coupons) {
		coupons.forEach(function (coupon) {
			if (coupon.get('type') == 'user') {
				var code = coupon.get('codeNumber');
				var query = new AV.Query(AV.User);
				query.equalTo('myDiscountCode', code);
				query.find().then(function (srcUser) {
					if (srcUser.length == 0) {
						return;
					}
					if (srcUser[0].id == coupon.get('user').id) {
						return;
					}
					var newCoupon = new Coupon();
					newCoupon.set('user', srcUser[0]);
					newCoupon.set('discountRule', coupon.get('discountRule'));
					newCoupon.set('validSource', coupon.get('validSource'));
					newCoupon.set('validDest', coupon.get('validDest'));
					newCoupon.set('validStartTime', coupon.get('validStartTime'));
					newCoupon.set('validEndTime', coupon.get('validEndTime'));
					newCoupon.set('validPrice', coupon.get('validPrice'));
					newCoupon.set('discountPrice', coupon.get('discountPrice'));
					newCoupon.set('codeNumber', code);
					newCoupon.set('show', coupon.get('show'));
					newCoupon.set('type', 'user');
					newCoupon.set('isValid', true);
					newCoupon.set('isUsed', false);
					newCoupon.set('isDeleted', false);
					newCoupon.save();
				});
			}
			coupon.set('isUsed', true);
			coupon.set('isValid', false);
			coupon.save();
		});
	});
	promise = promise.then(function () {
		return ticketMethod.createTicketP(order);
	});
	return promise;
}

exports.createOrderP = createOrderP;
exports.addCouponsP = addCouponsP;
exports.removeCouponsP = removeCouponsP;
exports.listOrdersP = listOrdersP;
exports.avOrderListToFrontOrderList = avOrderListToFrontOrderList;
exports.avOrderInfoToFrontOrderInfo = avOrderInfoToFrontOrderInfo;
exports.getOrderP = getOrderFastP;
exports.deleteTimeOutOrderP = deleteTimeOutOrderP;
exports.cancelOrderP = cancelOrderP;
exports.payOrderP = payOrderP;
exports.checkCouponValidForOrder = checkCouponValidForOrder;
exports.countFinalPrice = countFinalPrice;
