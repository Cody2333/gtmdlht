var AV = require('leanengine');
var Area = AV.Object.extend("Area");
var Location = AV.Object.extend('Location');
var Route = AV.Object.extend('Route');
var Order = AV.Object.extend('Order');
var UnCheckedRoute = AV.Object.extend('UnCheckedRoute');
var moment = require('moment');

function addFrontAreaList(areas, area) {
	for (var i = 0; i < areas.length; i++) {
		if (areas[i].id == area.id) {
			return;
		}
	}
	areas.push({
		id: area.id,
		name: area.get("name"),
		parentId: area.get('pid')
	});
}

function addFrontLocationList(locations, location) {
	for (var i = 0; i < locations.length; i++) {
		if (locations[i].id == location.id) {
			return;
		}
	}
	var cityId = null;
	if (location.get('area') != null) {
		cityId = location.get('area').id;
	}
	locations.push({
		id: location.id,
		cityId: cityId,
		name: location.get('location'),
		fullName: location.get('locationFullName'),
		longitude: location.get('lng'),
		latitude: location.get('lat')
	});
}

//数据库里的地区转化为前端使用的格式
function avAreaToFrontArea(areas) {
	if (areas == null) {
		return null;
	}
	var results = [];
	for (var i = 0; i < areas.length; i++) {
		results.push({
			id: areas[i].id,
			name: areas[i].get('name'),
			parentId: areas[i].get('pid')
		});
	}
	return results;
}

//数据库里的地址转化为前端使用的格式
function avLocationToFrontLocation(locations) {
	if (locations == null) {
		return null;
	}
	var results = [];
	for (var i = 0; i < locations.length; i++) {
		var cityId = null;
		if (locations[i] == null) {
			continue;
		}
		if (locations[i].get('area') != null) {
			cityId = locations[i].get('area').id;
		}
		results.push({
			id: locations[i].id,
			cityId: cityId,
			name: locations[i].get('location'),
			fullName: locations[i].get('locationFullName'),
			longitude: locations[i].get('lng'),
			latitude: locations[i].get('lat')
		})
	}
	return results;
}

//将数据库中的路线转化为前端使用的格式
function avRouteToFrontRoute(routes) {
	if (routes == null) {
		return null;
	}
	var results = [];
	for (var i = 0; i < routes.length; i++) {
		var sources = [];
		var dests = [];
		sources.push(routes[i].get('source'));
		dests.push(routes[i].get('dest'));
		results.push({
			id: routes[i].id,
			src: avLocationToFrontLocation(sources)[0],
			dest: avLocationToFrontLocation(dests)[0],
			srcFullName: routes[i].get('sourceFullName'),
			destFullName: routes[i].get('destFullName'),
			srcBusStop: routes[i].get('sourceBusStop'),
			destBusStop: routes[i].get('destBusStop'),
			startTime: routes[i].get('startTime'),
			duration: routes[i].get('duration'),
			busTypeId: routes[i].get('carType'),
			personsPaid: routes[i].get('passengerNumber'),
			price: routes[i].get('price'),
			notice: routes[i].get('notice')
		});
	}
	return results;
}

function avUcRouteToFrontUcRoute(routes) {
	if (routes == null) {
		return null;
	}
	var results = [];
	for (var i = 0; i < routes.length; i++) {
		results.push({
			id: routes[i].id,
			userId: routes[i].get('user').id,
			src: routes[i].get('src'),
			dest: routes[i].get('dest'),
			supportNum: routes[i].get('supportNum')
		});
	}
	return results;
}


/*依据父地区ID,地区等级，是否为起点，是否为终点来查找路线
params	:parentId(string), level(0,1..), src(boolean), dest(boolean), skip(number), limit(number)
return	:AV.Promise
 */
function findAreaP(parentId, level, src, dest, skip, limit) {
	var query = new AV.Query(Area);
	//query.equalTo('isFinished',false);
	//query.equalTo('isDeleted',false);
	if (parentId != null) {
		query.equalTo('pid', parentId);
	}
	if (level != null) {
		query.equalTo('type', level);
	}
	if (src) {
		query.greaterThan('sourceRouteNumber', 0);
	}
	if (dest) {
		query.greaterThan('destRouteNumber', 0);
	}
	if (skip != null) {
		query.skip(skip);
	}
	if (limit != null) {
		query.limit(limit);
	}
	return query.find();
}

/*根据父地区ID,关键字，是否为起点，是否为终点来查找详细地址
params	:areaId(string), keywords(string), src(boolean), dest(boolean), skip(number), limit(number)
return	:AV.Promise
 */
function queryLocationsP(areaId, keywords, src, dest, skip, limit) {
	var query = new AV.Query(Location);
	query.equalTo('isDeleted', false);
	if (src) {
		query.greaterThan('sourceRouteNumber', 0);
	}
	if (dest) {
		query.greaterThan('destRouteNumber', 0);
	}
	if (skip != null) {
		query.skip(skip);
	}
	if (limit != null) {
		query.limit(limit);
	}
	if (areaId == null) {
		query.contains('locationFullName', keywords);
	} else {
		query.equalTo('area', AV.Object.createWithoutData('Area', areaId));
	}
	return query.find();
}

/*根据起点ID和终点ID来查找路线
params	:srcId(string),destId(string),skip(number),limit(number)
return	:AV.Promise
 */
function getRouteBySrcDestP(srcId, destId, skip, limit) {
	var query = new AV.Query(Route);
	if (srcId != null) {
		query.equalTo("source", AV.Object.createWithoutData('Location', srcId));
	}
	if (destId != null) {
		query.equalTo("dest", AV.Object.createWithoutData('Location', destId));
	}
	query.greaterThan('startTime', moment().add(1, 'h').toDate());
	query.equalTo("isFinished", false);
	query.equalTo("isDeleted", false);
	query.include('source');
	query.include('dest');
	if (skip != null) {
		query.skip(skip);
	}
	if (limit != null) {
		query.limit(limit);
	}
	return query.find();
}

/*根据起点关键字和终点关键字来查找路线
params	:srckey(string),destkey(string),skip(number),limit(number)
return	:AV.Promise
 */
function queryRouteByKeywordsP(srckey, destkey, skip, limit) {
	var query = new AV.Query(Route);
	query.equalTo("isFinished", false);
	query.equalTo("isDeleted", false);
	query.include('source');
	query.include('dest');
	query.greaterThan('startTime', moment().add(1, 'h').toDate());
	if (srckey != null) {
		query.contains('sourceFullName', srckey);
	}
	if (destkey != null) {
		query.contains('destFullName', destkey);
	}
	if (skip != null) {
		query.skip(skip);
	}
	if (limit != null) {
		query.limit(limit);
	}
	return query.find();
}

/*根据起点经纬度和终点经纬度来查找路线
params	:srclng(number), srclat(number), destlng(number), destlat(number), srcRange(number)“起点经纬度范围”, destRange(number)"终点经纬度范围", skip, limit
return	:AV.Promise
 */
function queryRouteByLngLatP(srclng, srclat, destlng, destlat, srcRange, destRange, skip, limit) {
	var query = new AV.Query(Route);
	query.equalTo("isFinished", false);
	query.equalTo("isDeleted", false);
	query.include('source');
	query.include('dest');
	query.greaterThan('startTime', moment().add(1, 'h').toDate());
	if (srclng != null) {
		query.greaterThan('sourceLng', srclng - srcRange);
		query.lessThan('sourceLng', srclng + srcRange);
		query.greaterThan('sourceLat', srclat - srcRange);
		query.lessThan('sourceLat', srclat + srcRange);
	}
	if (destlng != null) {
		query.greaterThan('destLng', destlng - destRange);
		query.lessThan('destLng', destlng + destRange);
		query.greaterThan('destLat', destlat - destRange);
		query.lessThan('destLat', destlat + destRange);
	}
	if (skip != null) {
		query.skip(skip);
	}
	if (limit != null) {
		query.limit(limit);
	}
	return query.find();
}

/*查找与目标详细地址相连的地址
params	:areaId(string)“这个参数作用是将查找到的结果限制在该地区内”,locationId(string),source(boolean),dest(boolean),skip(number),limit(number)
return	:AV.Promise
 */
function findConnectedLocationsP(areaId, locationId, source, dest, skip, limit) {
	var query = new AV.Query(Route);
	query.equalTo('isFinished', false);
	query.equalTo('isDeleted', false);
	query.greaterThan('startTime', moment().add(1, 'h').toDate());
	if (source) {
		query.equalTo('source', AV.Object.createWithoutData('Location', locationId));
		query.include('dest');
	}
	if (dest) {
		query.equalTo('dest', AV.Object.createWithoutData('Location', locationId));
		query.include('source');
	}
	return query.find().then(function (results) {
		var locationList = [];
		for (var i = 0; i < results.length; i++) {
			var location = null;
			if (source) {
				location = results[i].get('dest');
			}
			if (dest) {
				location = results[i].get('source');
			}
			if (areaId != null) {
				if (location.get('area').id == areaId) {
					addFrontLocationList(locationList, location);
				}
			} else {
				addFrontLocationList(locationList, location);
			}
		}
		return new AV.Promise(function (resolve, reject) {
			resolve(locationList);
		});
	});
}

/*查找与目标详细地址相连的地区
params	:locationId(string),source(boolean),dest(boolean),skip(number),limit(number)
return	:AV.Promise
 */
function findConnectedAreasP(locationId, source, dest, skip, limit) {
	var query = new AV.Query(Route);
	query.equalTo('isDeleted', false);
	query.equalTo('isFinished', false);
	query.greaterThan('startTime', moment().add(1, 'h').toDate());
	if (source) {
		query.equalTo('source', AV.Object.createWithoutData('Location', locationId));
		query.include('dest.area');
	}
	if (dest) {
		query.equalTo('dest', AV.Object.createWithoutData('Location', locationId));
		query.include('source.area');
	}
	return query.find().then(function (results) {
		var areaList = [];
		for (var i = 0; i < results.length; i++) {
			var area = null;
			if (source) {
				area = results[i].get('dest').get('area');
			}
			if (dest) {
				area = results[i].get('source').get('area');
			}
			addFrontAreaList(areaList, area);
		}
		return new AV.Promise(function (resolve, reject) {
			resolve(areaList);
		});
	});
}

//查看路线详细信息
function viewRouteP(id) {
	var query = new AV.Query(Route);
	query.include('source');
	query.include('dest');
	return query.get(id);
}

//增加申请路线
function addUncheckRouteP(user, source, dest) {
	var newRoute = new UnCheckedRoute();
	newRoute.set('src', source);
	newRoute.set('dest', dest);
	newRoute.set('user', user);
	newRoute.set('supportNum', 0);
	return newRoute.save();
}

//重新计算路线已加入人数
function recountPassengerNumber(route){
	var query = new AV.Query(Order);
	query.equalTo('isDeleted',false);
	query.equalTo('route',route);
	query.notEqualTo('state','cancelled');
	query.notEqualTo('state','cancelling');
	query.limit(1000);
	query.find().then(function(results){
		var passengers=0;
		var perprice = route.get('price');
		for(var i=0;i<results.length;i++){
			passengers += results[i].get('price')/perprice;
		}
		route.set('passengerNumber',passengers);
		route.save();
	});
}

//重新计算所有路线的人数
function recountAllRoutesPSGN(){
    var query = new AV.Query(Route);
	query.equalTo('isFinished', false);
	query.equalTo('isDeleted', false);
    query.find().then(function(results){
       for(var i =0;i<results.length;i++){
           recountPassengerNumber(results[i]);
       } 
    });
}

exports.findAreaP = findAreaP;
exports.queryLocationsP = queryLocationsP;
exports.getRouteBySrcDestP = getRouteBySrcDestP;
exports.queryRouteByKeywordsP = queryRouteByKeywordsP;
exports.queryRouteByLngLatP = queryRouteByLngLatP;
exports.avAreaToFrontArea = avAreaToFrontArea;
exports.avLocationToFrontLocation = avLocationToFrontLocation;
exports.avRouteToFrontRoute = avRouteToFrontRoute;
exports.viewRouteP = viewRouteP;
exports.addUncheckRouteP = addUncheckRouteP;
exports.avUcRouteToFrontUcRoute = avUcRouteToFrontUcRoute;
exports.findConnectedLocationsP = findConnectedLocationsP;
exports.findConnectedAreasP = findConnectedAreasP;
exports.recountPassengerNumber = recountPassengerNumber;
exports.recountAllRoutesPSGN = recountAllRoutesPSGN;