var router = require('express').Router();
var areaMethod = require('./area');
var routeMethod = require('../route/route');
var commonRes = require('../common-response');

router.post('/listAreas',function(req,res){
	var parentId = req.body.parentId;
	var level = req.body.level;
	areaMethod.listAreasP(parentId,level).then(function(results){
		res.json({
			err :{
				code:0,
				des:""
			},
			ret : {
				areas : routeMethod.avAreaToFrontArea(results)
			}
		});
	},function(error){
		commonRes.unknownError(res,2,error);
	});
});

router.post('/listLocations',function(req,res){
	var parentId = req.body.parentId;
	areaMethod.listLocationsP(parentId).then(function(results){
		res.json({
			err :{
				code:0,
				des:""
			},
			ret :{
				locations : routeMethod.avLocationToFrontLocation(results)
			}
		});
	},function(error){
		commonRes.unknownError(res,2,error);
	});
});

module.exports = router;