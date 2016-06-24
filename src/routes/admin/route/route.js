var AV = require('leanengine');
var Route = AV.Object.extend('Route');
var UncheckedRoute = AV.Object.extend('UnCheckedRoute');
var Location = AV.Object.extend('Location');
var locationMethods = require('../location/location');
var carMethods = require('../car/car');
var userMethods = require('../user/user');

function packup(route) {
	if (route == null) {
		return null;
	}
	var result = {};
	result.id = route.id;
	result.src = locationMethods.packup(route.get("source"));
	result.srcStop = route.get("sourceBusStop");
	result.dest = locationMethods.packup(route.get("dest"));
	result.destStop = route.get("destBusStop");
	result.startTime = route.get("startTime").getTime();
	result.duration = route.get("duration");
	result.price = route.get("price");
	result.notice = route.get("notice");
	result.personsPaid = route.get('passengerNumber');
	result.isFinished = route.get('isFinished');

	return result;
}

// function packupPoor(route) {
// 	var result = {};
// 	result.id = route.id;
// 	result.src = locationMethods.packup(route.get("source"));
// 	result.srcStop = route.get("sourceBusStop");
// 	result.dest = locationMethods.packup(route.get("dest"));
// 	result.destStop = route.get("destBusStop");
// 	result.startTime = route.get("startTime").getTime();
// 	result.duration = route.get("duration");
// 	result.price = route.get("price");

// 	return result;
// }

function packupUncheckedRoute(uncheckedRoute) {
	var result = {};
	result.id = uncheckedRoute.id;
	result.src = uncheckedRoute.get('src');
	result.dest = uncheckedRoute.get('dest');
	result.time = uncheckedRoute.createdAt.getTime();
	result.user = userMethods.packup(uncheckedRoute.get('user'));
	result.supportNum = uncheckedRoute.get('supportNum');
	return result;
}

function getRouteList(skip, limit, startTime, endTime) {
	var routeQuery = new AV.Query(Route);
	if (skip != null) {
		routeQuery.skip(skip);
	}
	if (limit != null) {
		routeQuery.limit(limit);
	}
	if (startTime != null) {
		// console.log(new Date(startTime * 1000));
		routeQuery.greaterThanOrEqualTo('startTime', new Date(startTime));
	}
	if (endTime != null) {
		// console.log(new Date(endTime * 1000));
		routeQuery.lessThanOrEqualTo('startTime', new Date(endTime));
	}
	routeQuery.include("source");
	routeQuery.include("dest");
	routeQuery.equalTo("isDeleted", false);
	routeQuery.descending('createdAt');
	return routeQuery.find();
}

function getUnfinishedRouteList(skip, limit, startTime, endTime) {
	var routeQuery = new AV.Query(Route);
	if (skip != null) {
		routeQuery.skip(skip);
	}
	if (limit != null) {
		routeQuery.limit(limit);
	}
	if (startTime != null) {
		// console.log(new Date(startTime * 1000));
		routeQuery.greaterThanOrEqualTo('startTime', new Date(startTime));
	}
	if (endTime != null) {
		// console.log(new Date(endTime * 1000));
		routeQuery.lessThanOrEqualTo('startTime', new Date(endTime));
	}
	routeQuery.include("source");
	routeQuery.include("dest");
	routeQuery.equalTo("isDeleted", false);
	routeQuery.equalTo('isFinished', false);
	routeQuery.descending('createdAt');
	return routeQuery.find();
}

function getRouteCount(startTime, endTime) {
	var routeQuery = new AV.Query(Route);
	if (startTime != null) {
		routeQuery.greaterThan('startTime', new Date(startTime));
	}
	if (endTime != null) {
		routeQuery.lessThan('startTime', new Date(endTime));
	}
	routeQuery.equalTo('isDeleted', false);
	return routeQuery.count();
}

function getUnfinishedRouteCount(startTime, endTime) {
	var routeQuery = new AV.Query(Route);
	if (startTime != null) {
		routeQuery.greaterThan('startTime', new Date(startTime));
	}
	if (endTime != null) {
		routeQuery.lessThan('startTime', new Date(endTime));
	}
	routeQuery.equalTo('isDeleted', false);
	routeQuery.equalTo('isFinished', false);
	return routeQuery.count();
}

function addRoute(src, dest, srcStop, destStop, startTime, duration, price, notice) {
	var route = new Route();
	var srcLocation = new Location();
	var destLocation = new Location();
	srcLocation.id = src.id;
	destLocation.id = dest.id;
	route.set("isDeleted", false);
	route.set("isFinished", false);
	route.set("source", srcLocation);
	route.set("sourceLat", src.lat);
	route.set("sourceLng", src.lng);
	route.set("sourceFullName", src.name);
	route.set("sourceBusStop", srcStop);
	route.set("dest", destLocation);
	route.set("destLat", dest.lat);
	route.set("destLng", dest.lng);
	route.set("destFullName", dest.name);
	route.set("destBusStop", destStop);
	route.set("startTime", new Date(startTime));
	route.set("duration", duration);
	route.set("price", price);
	route.set("notice", notice);
	route.set("passengerNumber", 0);
	return route.save(null)
	.then(function() {
		var promises = [];
		promises.push(locationMethods.increaseLocationSrcNum(src.id, 1));
		promises.push(locationMethods.increaseLocationDestNum(dest.id, 1));
		return new AV.Promise.when(promises);
	});
}

function finishRoute(routeId) {
	var route = new Route();
	var routeQuery = new AV.Query(Route);

	return routeQuery.get(routeId)
	.then(function(result) {
		if (result.get('isFinished') == true) {
			return AV.Promise.error('路线已经完成');
		}
		if (result.get('isDeleted') == true) {
			return AV.Promise.error('路线已经被删除');
		}
		route = result;
		route.set('isFinished', true);
		return route.save();
	})
	.then(function() {
		var promises = [];
		promises.push(locationMethods.decreaseLocationSrcNum(route.get('source').id, 1));
		promises.push(locationMethods.decreaseLocationDestNum(route.get('dest').id, 1));
		return AV.Promise.all(promises);
	});
}

function deleteRoute(routeId) {
	var route = new Route();
	var routeQuery = new AV.Query(Route);

	return routeQuery.get(routeId)
	.then(function(result) {
		if (result.get('isDeleted') == true) {
			return AV.Promise.error('路线已经被删除');
		}
		route = result;
		route.set('isDeleted', true);
		return route.save();
	})
	.then(function() {
		if (route.get('isFinished') == true) {
			return AV.Promise.as();
		}
		var promises = [];
		promises.push(locationMethods.decreaseLocationSrcNum(route.get('source').id, 1));
		promises.push(locationMethods.decreaseLocationDestNum(route.get('dest').id, 1));
		return AV.Promise.all(promises);
	});
}

function getUncheckedRouteList(skip, limit) {
	var uncheckedRouteQuery = new AV.Query(UncheckedRoute);
	if(skip!=null) {
		uncheckedRouteQuery.skip(skip);
	}
	if(limit!=null) {
		uncheckedRouteQuery.limit(limit);
	}
	uncheckedRouteQuery.equalTo('isDeleted', false);
	uncheckedRouteQuery.include('user');
	uncheckedRouteQuery.include('supportUsers');
	uncheckedRouteQuery.descending('createdAt');
	return uncheckedRouteQuery.find();
}

function authorityToModify(id) {
	var routeQuery = new AV.Query(Route);
	routeQuery.get(id)
	.then(function(result) {
		if (result.isFinished == true || result.isDeleted == true)
			return AV.Promise.error('无法修改已完成路线');
		return AV.Promise.as();
	});
}

exports.packup = packup;
// exports.packupPoor = packupPoor;
exports.packupUncheckedRoute = packupUncheckedRoute;
exports.getRouteList = getRouteList;
exports.getUnfinishedRouteList = getUnfinishedRouteList;
exports.getRouteCount = getRouteCount;
exports.getUnfinishedRouteCount = getUnfinishedRouteCount;
exports.addRoute = addRoute;
exports.finishRoute = finishRoute;
exports.deleteRoute = deleteRoute;
exports.getUncheckedRouteList = getUncheckedRouteList;
exports.authorityToModify = authorityToModify;