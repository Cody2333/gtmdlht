var AV = require('leanengine');

var passengerMethods = require('../passenger/passenger');
var orderMethods = require('../order/order');
var scheduleMethods = require('../schedule/schedule');
var Ticket = AV.Object.extend('Ticket');
var Schedule = AV.Object.extend('Schedule');
var Order = AV.Object.extend('Order');
var Route = AV.Object.extend('Route');

function packup(ticket) {
	var result = {};
	result.id = ticket.id;
	result.passenger = passengerMethods.packup(ticket.get('passenger'));
	if (ticket.get('schedule') != null) {
		result.scheduleId = ticket.get('schedule').id;
	}
	result.code =ticket.get('code');
	result.seatNumber =ticket.get('seatNumber');
	result.state = ticket.get('state');
	return result;
}

function getTicketListByScheduleId(scheduleId) {
	var ticketQuery = new AV.Query(Ticket);
	var schedule = new Schedule();
	schedule.id = scheduleId;

	ticketQuery.skip(0);
	ticketQuery.limit(1000);
	ticketQuery.equalTo('schedule', schedule);
	ticketQuery.equalTo('isDeleted', false);
	ticketQuery.include('order');
	ticketQuery.include('passenger');
	ticketQuery.include('schedule');

	return ticketQuery.find();
}

function setSchedule(ticketId, scheduleId, seatNumber) {
	var ticket = new Ticket();
	var schedule = new Schedule();
	schedule.id = scheduleId;
	ticket.id = ticketId;
	ticket.set('schedule', schedule);
	ticket.set('seatNumber', seatNumber);
	return ticket.save(null);
}

function removeScheduleByScheduleId(scheduleId) {
	var ticketQuery = new AV.Query(Ticket);
	var schedule = new Schedule();
	schedule.id = scheduleId;

	ticketQuery.skip(0);
	ticketQuery.limit(1000);
	ticketQuery.equalTo('schedule', schedule);
	ticketQuery.equalTo('isDeleted', false);
	ticketQuery.find()
	.then(function(results) {
		var promises = [];
		for (var i = 0; i < results.length; i++) {
			results[i].set('schedule', null);
			promises.push(results[i].save());
		}
		return AV.Promise.all(promises);
	}, function(err) {
		console.log("error in remove schdeule by schedule id");
		console.log(err);
	});
}

function getTicketListByRouteId(skip, limit, routeId) {
	var ticketQuery = new AV.Query(Ticket);
	var route = new Route();
	route.id = routeId;

	ticketQuery.equalTo('route', route);
	ticketQuery.equalTo('isDeleted', false);
	ticketQuery.equalTo('state', 'unused');
	if (skip != null) {
		ticketQuery.skip(skip);
	}
	if (limit != null) {
		ticketQuery.limit(limit);
	}

	ticketQuery.include('order');
	ticketQuery.include('passenger');
	ticketQuery.include('schedule');

	return ticketQuery.find();
	

	// orderQuery.equalTo('route', route);
	// orderQuery.equalTo('state', 'paid');
	// orderQuery.equalTo('isDeleted', false);
	// orderQuery.skip(0);
	// orderQuery.limit(500);

	// var promise = orderQuery.find();
	// promise = promise.then(function(results) {
	// 	orders = results;
	// });
}

function autoDistribute(routeId) {
	var orders;
	var schedules;
	var totalSeat = 0;
	var totalTicket = 0;
	var ticketsArray = [];
	return orderMethods.getOrderListByRouteId(routeId)
	.then(function(results) {
		orders = results;
		var promises = [];
		for (var i = 0; i < orders.length; i++) {
			var relation = orders[i].relation('tickets');
			promises.push(relation.query().find());
		}
		return AV.Promise.all(promises);
		
	})
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			ticketsArray.push(results[i]);
			totalTicket += results[i].length;
		}
		return scheduleMethods.getScheduleListByRouteId(routeId);
	})
	.then(function(results) {
		schedules = results;
		for (var i = 0; i < schedules.length; i++) {
			totalSeat += schedules[i].get('totalSeat');
		}
		if (totalSeat < totalTicket)
			return AV.Promise.error("座位数不足");
		var weight = totalTicket / totalSeat;
		for (var i = 0; i < schedules.length; i++) {
			scheduleMethods.discreaseSeat(schedules[i].id, schedules[i].get('takenSeat')); // set taken seat to 0
			schedules[i].takenSeat = 0;
			schedules[i].limitSeat = Math.ceil(schedules[i].get('totalSeat') * weight);
			// to avoid limit seat > total seat
			schedules[i].limitSeat = schedules[i].limitSeat>schedules[i].get('totalSeat') ? schedules[i].get('totalSeat') : schedules[i].limitSeat;
		}
	})
	.then(function() {
		for (var i = 0; i < ticketsArray.length; i++) {
			var flag = 0;
			var ticketNum = ticketsArray[i].length;
			for (var j = 0; j < schedules.length; j++) {
				if (schedules[j].takenSeat < schedules[j].limitSeat 
					&& schedules[j].takenSeat + ticketNum < schedules[j].get('totalSeat')) {
					for (var k = 0; k < ticketNum; k++) {
						setSchedule(ticketsArray[i][k].id, schedules[j].id, schedules[j].takenSeat + k + 1);
					}
					scheduleMethods.increaseSeat(schedules[j].id, ticketNum);
					schedules[j].takenSeat += ticketNum;
					flag = 1;
					break;
				}
			}
			// hasn't distribute this order
			if (flag == 1)
				continue;
			for (var j = 0; j < ticketNum; j++) {
				for (var k = 0; k < schedules.length; k++) {
					if (schedules[k].takenSeat < schedules[k].limitSeat) {
						setSchedule(ticketsArray[i][j].id, schedules[k].id, schedules[k].takenSeat + 1);
						scheduleMethods.increaseSeat(schedules[k].id, 1);
						schedules[k].takenSeat += 1;
						break;
					}
				}
			}
		}
	});
}

exports.packup = packup;
exports.setSchedule = setSchedule;
exports.getTicketListByScheduleId = getTicketListByScheduleId;
exports.getTicketListByRouteId = getTicketListByRouteId;
exports.removeScheduleByScheduleId = removeScheduleByScheduleId;
exports.autoDistribute = autoDistribute;