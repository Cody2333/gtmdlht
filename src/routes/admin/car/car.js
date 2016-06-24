var AV = require('leanengine');

var CarType = AV.Object.extend('CarType');

function packup(carType) {
	var result = {};
	result.id = carType.id;
	result.type = carType.get("type");
	result.totalSeat = carType.get("totalSeat");
	result.company = carType.get("company");
	return result;
}

function getCarList(skip, limit) {
	var carTypeQuery = new AV.Query(CarType);
	carTypeQuery.equalTo('isDeleted', false);
	if (skip != null) {
		carTypeQuery.skip(skip);
	}
	if (limit != null) {
		carTypeQuery.limit(limit);
	}
	return carTypeQuery.find();
}

function deleteCar(carId) {
	var carType = new CarType();
	carType.id = carId;
	carType.set('isDeleted', false);
	return carType.save();
}

function addCar(company, type, totalSeat) {
	var carType = new CarType();
	carType.set('company', company);
	carType.set('type', type);
	carType.set('totalSeat', totalSeat);
	carType.set('isDeleted', false);
	return carType.save();
}

exports.packup = packup;
exports.getCarList = getCarList;
exports.deleteCar = deleteCar;
exports.addCar = addCar;