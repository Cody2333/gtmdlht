var routeRouter = require('express').Router();
var routeMethod = require('./route');
var commonRes = require('../common-response');


//列出地区，条件是存在以该地区为目的地的路线
routeRouter.post('/dest/city/list', function(req,res){
	var parentId = req.body.parentId;
	var level = req.body.level;
	var skip = req.body.skip;
	var limit = req.body.limit;
	routeMethod.findAreaP(parentId, level, false, true, skip, limit).then(function(areas){
		res.json({
			err :{
				code : 0,
				des : ""
			},
			ret : {
				cities : routeMethod.avAreaToFrontArea(areas)
			}
		});
	},function(error){
		commonRes.unknownError(res,1,error);
	});
});

//列出所有与指定起点相连的地区（省、市、区）
routeRouter.post('/dest/city/srcConnected',function(req,res){
	var locationId = req.body.locationId;
	var skip = req.body.skip;
	var limit = req.body.limit;
	routeMethod.findConnectedAreasP(locationId, true, false,skip,limit).then(function(areas){
		res.json({
			err : {
				code : 0,
				des : ""
			},
			ret :{
				cities : areas
			}
		})
	},function(err){
		commonRes.unknownError(res,2,err);
	})
});

//列出所有与指定起点相连的终点（确切地点）
routeRouter.post('/dest/location/srcConnected',function(req,res){
	var areaId = req.body.cityId;
	var locationId = req.body.locationId;
	var skip = req.body.skip;
	var limit = req.body.limit;
	routeMethod.findConnectedLocationsP(areaId,locationId, true, false,skip,limit).then(function(locations){
		res.json({
			err : {
				code : 0,
				des : ""
			},
			ret :{
				locations : locations
			}
		})
	},function(err){
		commonRes.unknownError(res,2,err);
	})
});

//列出指定地区内的所有终点
routeRouter.post('/dest/city/subLocationList',function(req,res){
	var areaId = req.body.cityId;
	var skip = req.body.skip;
	var limit = req.body.limit;
	routeMethod.queryLocationsP(areaId,null,false,true,skip,limit).then(function(results){
		res.json({
			err : {
				code : 0,
				des : ""
			},
			ret : {
				locations : routeMethod.avLocationToFrontLocation(results)
			}
		})
	},function(error){
		commonRes.unknownError(res,2,error);
	});
});

//按照地区或者关键字查找终点
routeRouter.post('/dest/query', function(req,res){
	var cityId = req.body.cityId;
	var keywords = req.body.keywords;
	var skip = req.body.skip;
	var limit = req.body.limit;
	routeMethod.queryLocationsP(cityId, keywords, false, true, skip, limit).then(function(locations){
		res.json({
			err : {
				code : 0,
				des : ""
			},
			ret :{
				dests : routeMethod.avLocationToFrontLocation(locations)
			}
		});
	},function(error){
		commonRes.unknownError(res, 1, error);
	});
});

//列出地区，条件是存在以该地区为起点的路线
routeRouter.post('/src/city/list',function(req,res){
	var parentId = req.body.parentId;
	var level = req.body.level;
	var skip = req.body.skip;
	var limit = req.body.limit;
	routeMethod.findAreaP(parentId, level, true, false, skip, limit).then(function(areas){
		res.json({
			err :{
				code : 0,
				des : ""
			},
			ret : {
				cities : routeMethod.avAreaToFrontArea(areas)
			}
		});
	},function(error){
		commonRes.unknownError(res,1,error);
	});
});

//列出所有与指定终点相连的地区（省、市、区）
routeRouter.post('/src/city/destConnected',function(req,res){
	var locationId = req.body.locationId;
	var skip = req.body.skip;
	var limit = req.body.limit;
	routeMethod.findConnectedAreasP(locationId, false, true,skip,limit).then(function(areas){
		res.json({
			err : {
				code : 0,
				des : ""
			},
			ret :{
				cities : areas
			}
		})
	},function(err){
		commonRes.unknownError(res,2,err);
	})
});

//列出所有与指定终点相连的起点（确切地点）
routeRouter.post('/src/location/destConnected',function(req,res){
	var areaId = req.body.cityId;
	var locationId = req.body.locationId;
	var skip = req.body.skip;
	var limit = req.body.limit;
	routeMethod.findConnectedLocationsP(areaId,locationId, false, true,skip,limit).then(function(locations){
		res.json({
			err : {
				code : 0,
				des : ""
			},
			ret :{
				locations : locations
			}
		})
	},function(err){
		commonRes.unknownError(res,2,err);
	})
});

//列出指定地区内的所有起点
routeRouter.post('/src/city/subLocationList',function(req,res){
	var areaId = req.body.cityId;
	var skip = req.body.skip;
	var limit = req.body.limit;
	routeMethod.queryLocationsP(areaId,null,true,false,skip,limit).then(function(results){
		res.json({
			err : {
				code : 0,
				des : ""
			},
			ret : {
				locations : routeMethod.avLocationToFrontLocation(results)
			}
		})
	},function(error){
		commonRes.unknownError(res,2,error);
	});
});

//按照地区或者关键字查找起点
routeRouter.post('/src/query',function(req,res){
	var cityId = req.body.cityId;
	var keywords = req.body.keywords;
	var skip = req.body.skip;
	var limit = req.body.limit;
	routeMethod.queryLocationsP(cityId, keywords, true, false, skip, limit).then(function(locations){
		res.json({
			err : {
				code : 0,
				des : ""
			},
			ret :{
				dests : routeMethod.avLocationToFrontLocation(locations)
			}
		});
	},function(error){
		commonRes.unknownError(res, 1, error);
	});
});

//列出所有路线
routeRouter.post('/list',function(req,res){
	var skip = req.body.skip;
	var limit = req.body.limit;
	routeMethod.queryRouteByKeywordsP(null, null, skip, limit).then(function(routes){
		res.json({
			err : {
				code : 0,
				des : ""
			},
			ret :{
				routes : routeMethod.avRouteToFrontRoute(routes)
			}
		});
	},function(error){
		commonRes.unknownError(res, 1, error);
	});
});

//查询指定路线的详细信息
routeRouter.post('/view',function(req,res){
	var objId = req.body.id;
	routeMethod.viewRouteP(objId).then(function(route){
		var routes = [];
		routes.push(route);
		res.json({
			err : {
				code : 0,
				des : ""
			},
			ret : {
				route : routeMethod.avRouteToFrontRoute(routes)[0]
			}
		});
	},function(error){
		commonRes.unknownError(res,1, error);
	});
});


//按照终点起点的关键字查询路线
routeRouter.post('/query/keywords',function(req,res){
	var src = req.body.src;
	var dest = req.body.dest;
	var skip = req.body.skip;
	var limit = req.body.limit;
	routeMethod.queryRouteByKeywordsP(src, dest, skip, limit).then(function(routes){
		res.json({
			err : {
				code : 0,
				des : ""
			},
			ret : {
				routes : routeMethod.avRouteToFrontRoute(routes)
			}
		});
	},function(error){
		commonRes.unknownError(res,1,error);
	});
});

//列出指定终点起点的所有路线信息
routeRouter.post('/query/srcAndDest',function(req,res){
	var srcId = req.body.srcId;
	var destId = req.body.destId;
	var skip = req.body.skip;
	var limit = req.body.limit;
	routeMethod.getRouteBySrcDestP(srcId, destId, skip, limit).then(function(routes){
		res.json({
			err : {
				code : 0,
				des : ""
			},
			ret : {
				routes : routeMethod.avRouteToFrontRoute(routes)
			}
		});
	},function(error){
		commonRes.unknownError(res,1,error);
	});
});

//按照经纬度查询路线
routeRouter.post('/query/lngAndLat',function(req,res){
	var srcLng = req.body.srcLng;
	var srcLat = req.body.srcLat;
	var destLng = req.body.destLng;
	var destLat = req.body.destLat;
	var srcRange = req.body.srcRange;
	var destRange = req.body.destRange;
	var skip = req.body.skip;
	var limit = req.body.limit;
	routeMethod.queryRouteByLngLatP(srcLng, srcLat, destLng, destLat, srcRange, destRange, skip, limit).then(function(routes){
		res.json({
			err : {
				code : 0,
				des : ""
			},
			ret : {
				routes : routeMethod.avRouteToFrontRoute(routes)
			}
		});
	},function(error){
		commonRes.unknownError(res,1,error);
	});
});


module.exports = routeRouter;