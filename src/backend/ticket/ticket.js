var AV = require('leanengine');
var Ticket = AV.Object.extend('Ticket');
var Schedule = AV.Object.extend('Schedule');
var Order = AV.Object.extend('Order');
var Passenger = AV.Object.extend('Passenger');
var routeMethod = require('../route/route');
var moment = require('moment');
var passengerMethod = require('../passenger/passenger');
var scheduleMethod = require('../schedule/schedule');

/*在数字之前补0
params	:num(string), n(number)"要补齐的位数"
return	:num(string)
*/
function pad(num, n) {
    var len = num.toString().length;
    while (len < n) {
        num = "0" + num;
        len++;
    }
    return num;
}

/*将后台数据库的车票数据转化为前端的格式*/
function avTicketToFrontTicket(tickets) {
	if (tickets == null) {
		return null;
	}
	var result = [];
	for (var i = 0; i < tickets.length; i++) {
		if (tickets[i] == null) {
			continue;
		}
		var passenger = [];
		var route = [];
		var schedule = [];
		passenger.push(tickets[i].get('passenger'));
		route.push(tickets[i].get('route'));
		schedule.push(tickets[i].get('schedule'));
		result.push({
			id: tickets[i].id,
			orderId: tickets[i].get('orderId'),
			passenger: passengerMethod.avpassengersToFrontArray(passenger)[0],
			route: routeMethod.avRouteToFrontRoute(route)[0],
			schedule: scheduleMethod.avScheduleToFrontSchedule(schedule)[0],
			code: tickets[i].get('code'),
			seatNumber: tickets[i].get('seatNumber'),
			state: tickets[i].get('state')
		});
	}
	return result;
}


/*生成随机车票号码（前4位为顺序的号码，后两位为随机数）
params	:count(number)"该路线已分配车票总人数", route(object)[DBdoc中的格式]
return	:code(string)
*/
function genTicketCode(count, route) {
	var code = '';
	var aCode = "a".charCodeAt(0);
	var allTickets = pad(count, 4);
	for (var i = 0; i < 2; i++) {
		var randNum = parseInt(Math.random() * 10);
		if (randNum >= 10) {
			code += String.fromCharCode(aCode + randNum - 10);
		} else {
			code += randNum;
		}
	}
	code = allTickets + code;
	return code;
}

/*根据订单来创建车票
params	:order(object)[DBdoc中的格式]
return	:AV.Promise
此函数会在根据order的路线和乘客数量创建对应数量的ticket
*/
function createTicketP(order) {
	var promise = AV.Promise.as();
	var passengerR = order.relation('passengers');
	var ticketR = order.relation('tickets');
	var allTickets;
	promise = promise.then(function () {
		var query = new AV.Query(Ticket);
		query.equalTo('route', order.get('route'));
		query.equalTo('isDeleted', false);
		return query.count();
	})
	//得到该路线已有的所有车票（生成车票号码用，前四位顺序排下去）
	promise = promise.then(function (count) {
		allTickets = count;
		return passengerR.query().find();
	});
	//给每个乘客生成一张车票
	promise = promise.then(function (passengers) {
		var promises = [];
		for (var i = 0; i < passengers.length; i++) {
			var code = genTicketCode(allTickets + i, order.get('route'));
			var ticket = new Ticket();
			ticket.set('order', order);
			ticket.set('passenger', passengers[i]);
			ticket.set('route', order.get('route'));
			ticket.set('code', code);
			ticket.set('state', 'unused');
			ticket.set('isDeleted', false);
			promises.push(ticket.save());
		}
		var promise = AV.Promise.all(promises);
		promise = promise.then(function (tickets) {
			tickets.forEach(function (ticket) {
				ticketR.add(ticket);
			});
			return order.save();
		});
		return promise;
	});
	return promise;
}

/*查找指定订单的车票
params	:orderId
return	:AV.Promise
*/
function listByOrderP(orderId) {
	var query = new AV.Query(Order);
	return query.get(orderId).then(function (order) {
		var query = order.relation('tickets').query();
		query.include('schedule');
		query.include('route');
		query.equalTo('isDeleted', false);
		return query.find();
	});
}

/*查找指定手机号的车票
params	:phone(string)
return	:AV.Promise
*/
function listByPhoneP(phone) {
	var query = new AV.Query(Passenger);
	query.equalTo('phone', phone);
	return query.find().then(function (result) {
		if (result.length == 0) {
			return AV.Promise.error('没有对应手机号的乘客');
		}
		var promises = [];
		result.forEach(function (passenger) {
			var query = new AV.Query(Ticket);
			query.equalTo('passenger', result[0]);
			query.include('schedule');
			query.include('route');
			query.include('state', 'unused');
			query.equalTo('isDeleted', false);
			promises.push(query.find());
		});
		return AV.Promise.all(promises).then(function (results) {
			var tickets = [];
			for (var i in results) {
				results[i].forEach(function (result) {
					tickets.push(result);
				})
			}
			return new AV.Promise(function (resolve, reject) {
				resolve(tickets);
			})
		});
	});
}

/*查找指定手机号的车票
params	:user(object)
return	:AV.Promise
*/
function listByUserP(user) {
	return new AV.Promise(function (resolve, reject) {
		var orders;
		var query = new AV.Query(Order);
		query.equalTo('user', user);
		query.equalTo('state', 'paid');
		query.include('route');
		query.find()
		.then(function(_orders) {
			orders = _orders;
			var promises = [];
			orders.forEach(function (order) {
				var query = new AV.Query(Ticket);
				query.equalTo('order', order);
				query.equalTo('isDeleted', false);
				query.include('passenger');
				promises.push(query.find());
			});
			return AV.Promise.all(promises);
		})
		.then(function (ticketss) {
			var result = [];
			for (var i in orders) {
				var route = orders[i].get('route');
				var orderTickets = {
					route: {
						src			: route.get('sourceFullName'),
						dest		: route.get('destFullName'),
						departure	: route.get('startTime')
					},
					tickets: []
				};
				for (var j in ticketss[i]) {
					orderTickets.tickets.push({
						id			: ticketss[i][j].id,
						name		: ticketss[i][j].get('passenger').get('name'),
						code		: ticketss[i][j].get('code'),
						state		: ticketss[i][j].get('state')
					});
				}
				result.push(orderTickets);
			}
			resolve(result);
		});
	});
}


//车票详细信息
function ticketInfoP(id) {
	var query = new AV.Query(Ticket);
	query.include('schedule');
	query.include('route');
	return query.get(id);
}


//使用车票
function useTicketP(ids) {
	return new AV.Promise(function (resolve, reject) {
		AV.Promise.all(ids.map(function (id) {
			var query = new AV.Query(Ticket);
			query.include('schedule.route');
			return query.get(id);
		}))
		.then(function (tickets) {
			var success = true;
			for (var i in tickets) {
				var ticket = tickets[i];
				if (ticket.get('state') !== 'unused') {
					reject('票已被使用或无效');
					success = false;
					break;
				} else if (!ticket.get('schedule')) {
					reject('这张票还未分配班次');
					success = false;
					break;
				} else if (moment().add(1, 'h').isBefore(ticket.get('schedule').get('route').get('startTime'))) {
					reject('检票时间未到');
					success = false;
					break;
				}
			}
			if (success) {
				return AV.Promise.all(tickets.map(function (ticket) {
					ticket.set('state', 'used');
					return ticket.save();
				}));
			}
		})
		.then(resolve, reject);
	});
}

/*给订单中的ticket分配班次
params	:order(object)[DBdoc中的格式]
return	:AV.Promise
 */
function assignTicketScheduleP(order) {
	//首先获取到总座位数
	var promise;
	var schedules;
	var psgSupposes = [];
	var route = order.get('route');
	promise = route.fetch().then(function (result) {
		route = result;
		var query = new AV.Query(Schedule);
		query.equalTo('route', route);
		query.equalTo('isDeleted', false);
		return query.find();
	});
	promise = promise.then(function (results) {
		schedules = results;
		if (schedules.length == 0) {
			return AV.Promise.error('没有查找到相关班次');
		}
		var totalSeats = 0;
		//计算每个schedule的应有座位
		for (var i = 0; i < schedules.length; i++) {
			totalSeats += schedules[i].get('totalSeat');
		}
		var totalPsg = route.get('passengerNumber');
		for (i = 0; i < schedules.length; i++) {
			psgSupposes.push((schedules[i].get('totalSeat') / totalSeats) * totalPsg);
		}
	});
	//开始分配座位
	promise = promise.then(function () {
		var promise = AV.Promise.as();
		promise = promise.then(function () {
			return order.relation('tickets').query().find();
		});
		//首先查看是否存在能容纳下所有车票的车子
		promise = promise.then(function (tickets) {
			var takenSeat, totalSeat;
			for (var i = 0; i < schedules.length; i++) {
				takenSeat = schedules[i].get('takenSeat');
				totalSeat = schedules[i].get('totalSeat');
				if (takenSeat < psgSupposes[i]) {
					if (takenSeat + tickets.length <= totalSeat) {
						var promises = [];
						tickets.forEach(function (ticket) {
							ticket.set('schedule', schedules[i]);
							promises.push(ticket.save());
						});
						schedules[i].increment('takenSeat', tickets.length);
						schedules[i].fetchWhenSave(true);
						promises.push(schedules[i].save());
						return AV.Promise.all(promises);
					}
				}
			}
			//进入下面这个循环就表明没有车子有足够多的剩余空位,那就把tickets打散平均分到有空位的车子上
			var promise = AV.Promise.as();
			tickets.forEach(function (ticket) {
				promise = promise.then(function () {
					var index = 0;
					for (i = 0; i < schedules.length; i++) {
						takenSeat = schedules[i].get('takenSeat');
						totalSeat = schedules[i].get('totalSeat');
						if (totalSeat > takenSeat) {
							index = i;
							ticket.set('schedule', schedules[index]);
							return ticket.save().then(function () {
								schedules[index].fetchWhenSave(true);
								schedules[index].increment('takenSeat');
								return schedules[index].save();
							});
						}
					}
				});
			});
			return promise;
		});
		return promise;
	});
	return promise;
}

exports.createTicketP = createTicketP;
exports.assignTicketScheduleP = assignTicketScheduleP;
exports.avTicketToFrontTicket = avTicketToFrontTicket;
exports.listByOrderP = listByOrderP;
exports.listByPhoneP = listByPhoneP;
exports.ticketInfoP = ticketInfoP;
exports.useTicketP = useTicketP;
exports.listByUserP = listByUserP;