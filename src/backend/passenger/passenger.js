var AV = require('leanengine');
var Passenger = AV.Object.extend('Passenger');

//将后台数据库中passenger转化为前端的格式
function avpassengersToFrontArray(results) {
	var passengers = [];
	for (var i = 0; i < results.length; i++) {
		var passenger = {};
		passenger.id = results[i].id;
		passenger.name = results[i].get("name");
		passenger.phone = results[i].get("phone");
		passenger.idnum = results[i].get("idNumber");
		passengers.push(passenger);
	}
	return passengers;
}

//保存从前端发送过来的passenger列表
function saveFromFrontPassengerP(user, passenger) {
	var psg = new Passenger();
	if (passenger.id != null) {
		psg.id = passenger.id;
		if (passenger.name == null) {
			return deletePassengerP(psg.id);
		} else {
			psg.set('name', passenger.name);
			psg.set('phone', passenger.phone);
			psg.set('idNumber', passenger.idnum);
			return psg.save();
		}
	} else {
		return addPassengerP(user, passenger.phone, passenger.name, passenger.idnum);
	}
}

//获取用户的乘客列表
function getPassengersByUserP(user, skip, limit) {
	var query = new AV.Query(Passenger);
	query.equalTo("user", user);
	query.equalTo("isDeleted", false);
	if (skip != null) {
		query.skip(skip);
	}
	if (limit != null) {
		query.limit(limit);
	}
	return query.find();
}

//给用户添加passenger
function addPassengerP(user, phone, name, idNumber) {
	var passenger = new Passenger();
	var query = new AV.Query(Passenger);
	query.equalTo("user", user);
	query.equalTo("idNumber", idNumber);
	query.equalTo('isDeleted', false);
	return query.count().then(function (count) {
		if (count == 0) {
			passenger.set("phone", phone);
			passenger.set("name", name);
			passenger.set("idNumber", idNumber);
			passenger.set("user", user);
			passenger.set("isDeleted", false);
			return passenger.save();
		} else {
			return AV.Promise.error('已经添加了相同的身份证的乘客');
		}
	});
}

function deletePassengerP(objId) {
	var query = new AV.Query(Passenger);
	return query.get(objId).then(function (object) {
		object.set("isDeleted", true);
		return object.save();
	});
}

exports.avpassengersToFrontArray = avpassengersToFrontArray;
exports.saveFromFrontPassengerP = saveFromFrontPassengerP;
exports.getPassengersByUserP = getPassengersByUserP;
exports.addPassengerP = addPassengerP;
exports.deletePassengerP = deletePassengerP;