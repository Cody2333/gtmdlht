var AV = require('leanengine');
var passengerRoute = require('express').Router();
var Passenger = AV.Object.extend("Passenger");
var passengerMethod = require('./passenger');
var commonRes = require('../common-response');
//获取用户的passenger列表
passengerRoute.post('/list', function (req, res) {
	var user = req.AV.user;
	var skip = req.body.skip;
	var limit = req.body.limit;
	passengerMethod.getPassengersByUserP(user, skip, limit).then(function (result) {
		var passengers = passengerMethod.avpassengersToFrontArray(result);
		res.json({
			err: {
				code: 0,
				des: ""
			},
			ret: {
				passengers: passengers
			}
		});
	}, function (error) {
		commonRes.unknownError(res, 2, error);
	});
});

//更新passenger
passengerRoute.post('/update', function (req, res) {
	var user = req.AV.user;
	var passengers = req.body.passengers;
	if (typeof passengers === 'string' || passengers instanceof String) {
		passengers = JSON.parse(passengers);
	}
	var promise = AV.Promise.as();
	var index = 0;
	for (var i = 0; i < passengers.length; i++) {
		promise = promise.then(function () {
			index++;
			return passengerMethod.saveFromFrontPassengerP(user, passengers[index - 1]);
		});
	}
	promise.then(function (result) {
		commonRes.simpleSuccess(res);
	}, function (error) {
		commonRes.unknownError(res, 2, error);
	});
});

/*添加新的passenger
params	:phone,name,idNumber
send	:{
			err,
			ret: passengerId
		}
*/
passengerRoute.post('/add', function (req, res) {
	var user = req.AV.user;
	var phone = req.body.phone;
	var name = req.body.name;
	var idNumber = req.body.idnum;
	passengerMethod.addPassengerP(user, phone, name, idNumber).then(function (psg) {
		res.json({
			err: {
				code: 0,
				des: ""
			},
			ret: {
				passengerId: psg.id
			}
		})
	}, function (error) {
		commonRes.unknownError(res, 2, error);
	});
});

passengerRoute.post('/delete', function (req, res) {
	var objId = req.body.objectId;
	passengerMethod.deletePassengerP(objId).then(function (obj) {
		commonRes.simpleSuccess(res);
	}, function (error) {
		commonRes.unknownError(res, 2, error);
	});
});

module.exports = passengerRoute;
