var AV = require('leanengine');

var Area = AV.Object.extend('Area');
var Location = AV.Object.extend('Location');

function packup(location) {
	var result = {};
	if (location == null) {
		return null;
	}
	result.id = location.id;
	result.name = location.get("locationFullName");
	result.lng = location.get("lng");
	result.lat = location.get("lat");
	return result;
}

function packupArea(area) {
	var result = {};
	result.id = area.id;
	result.name = area.get('name');
	result.parentId = area.get('pid');
	return result;
}

function getProvinceList() {
	var areaQuery = new AV.Query(Area);
	areaQuery.equalTo("type", "0");

	return areaQuery.find();
}

function getCityListByProvinceId(provinceId) {
	var areaQuery = new AV.Query(Area);
	areaQuery.equalTo("type", "1");
	areaQuery.equalTo("pid", provinceId);

	return areaQuery.find();
}

function getLocationList() {
	var locationQuery = new AV.Query(Location);
	locationQuery.equalTo("isDeleted", false);
	return locationQuery.find();
}

function addLocation(province, city, name, cityId, lat, lng) {
	var location = new Location();
	var area = new Area();
	area.id = cityId;
	location.set('locationFullName', province + city + name);
	location.set('area', area);
	location.set('location', name);
	location.set('isDeleted', false);
	location.set('lat', lat);
	location.set('lng', lng);
	return location.save(null);
}

function deleteLocationByLocationId(locationId) {
	var location = new Location();
	locationQuery = new AV.Query(Location);
	return locationQuery.get(locationId)
	.then(function(result) {
		if (result.get('sourceRouteNumber') != 0 || result.get('destRouteNumber') != 0) {
			return AV.Promise.error('该地点正在被使用中');
		}
		else {
			result.set('isDeleted', true);
			return result.save();
		}
	})
}

function increaseLocationSrcNum(id, num) {
	var location = new Location();
	var area = new Area();
	var areaQuery = new AV.Query(Area);
	var locationQuery = new AV.Query(Location);
	location.id = id;
	location.increment('sourceRouteNumber', num);

	return location.save()
	.then(function() {
		return locationQuery.get(id);
	})
	.then(function(result) {
		area.id = result.get('area').id;
		area.increment('sourceRouteNumber', num);
		return area.save();
	})
	.then(function() {
		return areaQuery.get(area.id)
	})
	.then(function(result) {
		var areaProvince = new Area();
		areaProvince.id = result.get('pid');
		areaProvince.increment('sourceRouteNumber', num);
		return areaProvince.save();
	});
}

function increaseLocationDestNum(id, num) {
	var location = new Location();
	var area = new Area();
	var areaQuery = new AV.Query(Area);
	var locationQuery = new AV.Query(Location);
	location.id = id;
	location.increment('destRouteNumber', num);
	return location.save()
	.then(function() {
		return locationQuery.get(id);
	})
	.then(function(result) {
		area.id = result.get('area').id;
		area.increment('destRouteNumber', num);
		return area.save();
	})
	.then(function() {
		return areaQuery.get(area.id)
	})
	.then(function(result) {
		var areaProvince = new Area();
		areaProvince.id = result.get('pid');
		areaProvince.increment('destRouteNumber', num);
		return areaProvince.save();
	});
}

function decreaseLocationSrcNum(id ,num) {
	var location = new Location();
	var area = new Area();
	var areaQuery = new AV.Query(Area);
	var locationQuery = new AV.Query(Location);
	location.id = id;
	location.increment('sourceRouteNumber', 0 - num);
	return location.save(null)
	.then(function() {
		return locationQuery.get(id);
	})
	.then(function(result) {
		area.id = result.get('area').id;
		area.increment('sourceRouteNumber', 0 - num);
		return area.save();
	})
	.then(function() {
		return areaQuery.get(area.id)
	})
	.then(function(result) {
		var areaProvince = new Area();
		areaProvince.id = result.get('pid');
		areaProvince.increment('sourceRouteNumber', 0 - num);
		return areaProvince.save();
	});
}

function decreaseLocationDestNum(id ,num) {
	var location = new Location();
	var area = new Area();
	var areaQuery = new AV.Query(Area);
	var locationQuery = new AV.Query(Location);
	location.id = id;
	location.increment('destRouteNumber', 0 - num);
	return location.save(null)
	.then(function() {
		return locationQuery.get(id);
	})
	.then(function(result) {
		area.id = result.get('area').id;
		area.increment('destRouteNumber', 0 - num);
		return area.save();
	})
	.then(function() {
		return areaQuery.get(area.id)
	})
	.then(function(result) {
		var areaProvince = new Area();
		areaProvince.id = result.get('pid');
		areaProvince.increment('destRouteNumber', 0 - num);
		return areaProvince.save();
	});
}

exports.packup = packup;
exports.packupArea = packupArea;
exports.getProvinceList = getProvinceList;
exports.getCityListByProvinceId = getCityListByProvinceId;
exports.getLocationList = getLocationList;
exports.addLocation = addLocation;
exports.deleteLocationByLocationId = deleteLocationByLocationId;

exports.increaseLocationSrcNum = increaseLocationSrcNum;
exports.increaseLocationDestNum = increaseLocationDestNum;
exports.decreaseLocationSrcNum = decreaseLocationSrcNum;
exports.decreaseLocationDestNum = decreaseLocationDestNum;