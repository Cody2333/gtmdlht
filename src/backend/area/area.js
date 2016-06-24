var AV = require('leanengine');
var Area = AV.Object.extend('Area');
var Location = AV.Object.extend('Location');
var routeMethod = require('../route/route');

function listAreasP(parentId,level){
	if(level == null){
		return AV.Promise.error("需要指定区域级别");
	}
	var query = new AV.Query(Area);
	if(parentId!=null){
		query.equalTo('pid',parentId);
	}
	query.equalTo('type',level);
	return query.find();
}

function listLocationsP(parentId){
	var parea = new Area();
	parea.set('id',parentId);
	var query = new AV.Query(Location);
	query.equalTo('area',parea);
	query.equalTo('isDeleted',false);
	return query.find();
}

exports.listAreasP = listAreasP;
exports.listLocationsP = listLocationsP;