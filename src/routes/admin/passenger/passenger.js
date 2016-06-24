var AV = require('leanengine');
var Passenger = AV.Object.extend('Passenger');
var User = AV.User;

function packup(passenger) {
	if (passenger == null) {
		return null;
	}
	var result = {};
	result.id = passenger.id;
	result.name = passenger.get('name');
	result.phone = passenger.get('phone');
	result.idnum = passenger.get('idNumber');
	return result;
}

function getPassengerListByUserId(userId) {
	var passengerQuery = new AV.Query(Passenger);
	var user = new User();
	user.id = userId;
	passengerQuery.equalTo('user', user);
	passengerQuery.equalTo('isDeleted', false);
	passengerQuery.include('user');
	return passengerQuery.find();
}

exports.packup = packup;
exports.getPassengerListByUserId = getPassengerListByUserId;