var AV = require('leanengine');
var Schedule = AV.Object.extend('Schedule');
var routeMethod = require('../route/route');

//将数据库里的schedule信息转化为前端所用格式
function avScheduleToFrontSchedule(schedules) {
	if (schedules == null) {
		return null;
	}
	var result = [];
	for (var i = 0; i < schedules.length; i++) {
		var routes = [];
		//如果schedule没有指定检票员、车牌号、司机三者之一则不返回结果
		if(schedules[i] == null || schedules[i].get('plateNumber') == null || schedules[i].get('plateNumber') == ""
		|| schedules[i].get('tellerName') == null || schedules[i].get('tellerName') == "" || schedules[i].get('driverName') == null
		|| schedules[i].get('driverName') == ""){
			continue;
		}
		result.push({
			id: schedules[i].id,
			conductor: {
				name: schedules[i].get('tellerName'),
				phone: schedules[i].get('tellerPhone')
			},
			driver: {
				name: schedules[i].get('driverName'),
				phone: schedules[i].get('driverPhone')
			},
			route: routeMethod.avRouteToFrontRoute(routes.push(schedules[i].get('route')))[0],
			plateNumber: schedules[i].get('plateNumber'),
			code: schedules[i].get('code'),
			company: schedules[i].get('company'),
			totalSeat: schedules[i].get('totalSeat'),
			takenSeat: schedules[i].get('takenSeat'),
			cipher : schedules[i].get('cipher'),
			isFinished: schedules[i].get('isFinished')

		});
	}
	return result;
}

function scheduleInfoP(id) {
	var query = new AV.Query(Schedule);
	query.include('route');
	return query.get(id);
}

exports.avScheduleToFrontSchedule = avScheduleToFrontSchedule;
exports.scheduleInfoP = scheduleInfoP;