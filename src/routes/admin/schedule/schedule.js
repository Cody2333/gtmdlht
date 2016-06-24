var AV = require('leanengine');
var userMethods = require('../user/user');
var ticketMethods =  require('../ticket/ticket');

var Route = AV.Object.extend('Route');
var Schedule = AV.Object.extend('Schedule');
var User = AV.User;

function packup(schedule) {
	var result = {};
	result.id = schedule.id;
	if (schedule.get('teller') != null) {
		result.teller = userMethods.packup(schedule.get('teller'));
	}
	result.totalSeat = schedule.get('totalSeat');
	result.company = schedule.get('company');
	result.takenSeat = schedule.get('takenSeat');
	result.driverName = schedule.get('driverName');
	result.driverPhone = schedule.get('driverPhone');
	result.tellerName = schedule.get('tellerName');
	result.tellerPhone = schedule.get('tellerPhone');
	result.plateNumber = schedule.get('plateNumber');
	result.routeId = schedule.get('route').id;
	result.cypher = schedule.get('cypher');
	result.code = schedule.get('code');
	result.password = schedule.get('password');
	return result;
}

function getScheduleById(scheduleId) {
	var scheduleQuery = new AV.Query(Schedule);
	scheduleQuery.equalTo('isDeleted', false);
	scheduleQuery.include('route');
	scheduleQuery.include('route.source');
	scheduleQuery.include('route.dest');

	return scheduleQuery.get(scheduleId);
}

function getScheduleListByRouteId(routeId) {
	var scheduleQuery = new AV.Query(Schedule);
	var route = new Route();
	route.id = routeId;
	scheduleQuery.equalTo('route', route);
	scheduleQuery.equalTo('isDeleted', false);
	scheduleQuery.ascending('createdAt');
	scheduleQuery.include('route');
	scheduleQuery.include('teller');
	return scheduleQuery.find();
}

function addScheduleByRouteId(routeId) {
	var schedule = new Schedule();
	var route = new Route();
	route.id = routeId;
	schedule.set('route', route);
	schedule.set('isDeleted', false);
	schedule.set('isFinished', false);
	schedule.set('takenSeat', 0);
	schedule.set('totalSeat', 0);
	schedule.set('company', "");
	schedule.set('code', "");
	return schedule.save(null);
}

function updateSchedule(schedule) {
	var newSchedule = new Schedule();
	newSchedule.id = schedule.id;
	if (schedule.teller != null) {
		var teller = new User();
		teller.id = schedule.teller.id;
		newSchedule.set('teller', teller);
	}
	newSchedule.set('takenSeat', schedule.takenSeat);
	newSchedule.set('driverName', schedule.driverName);
	newSchedule.set('driverPhone', schedule.driverPhone);
	newSchedule.set('plateNumber', schedule.plateNumber);
	newSchedule.set('totalSeat', schedule.totalSeat);
	newSchedule.set('company', schedule.company);
	newSchedule.set('cypher', schedule.cypher);
	newSchedule.set('code', schedule.code);
	newSchedule.set('password', schedule.password);
	newSchedule.set('tellerName', schedule.tellerName);
	newSchedule.set('tellerPhone', schedule.tellerPhone);

	return newSchedule.save(null);
}

function increaseSeat(scheduleId, num) {
	var schedule = new Schedule();
	schedule.id = scheduleId;
	schedule.increment("takenSeat", num);
	return schedule.save();
}

function discreaseSeat(scheduleId, num) {
	var schedule = new Schedule();
	schedule.id = scheduleId;
	num = 0 - num;
	schedule.increment("takenSeat", num);
	return schedule.save();
}

function deleteSchedule(scheduleId) {
	var schedule = new Schedule();
	schedule.id = scheduleId;
	schedule.set('isDeleted', true);
	return schedule.save();
}

exports.packup = packup;
exports.getScheduleById = getScheduleById;
exports.getScheduleListByRouteId = getScheduleListByRouteId;
exports.addScheduleByRouteId = addScheduleByRouteId;
exports.updateSchedule = updateSchedule;
exports.deleteSchedule = deleteSchedule;
exports.increaseSeat = increaseSeat;
exports.discreaseSeat = discreaseSeat;
exports.deleteSchedule = deleteSchedule;