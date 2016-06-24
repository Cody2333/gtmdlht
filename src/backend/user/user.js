var AV = require('leanengine');
var Location = AV.Object.extend('Location');
var UserInfo = AV.Object.extend('UserInfo');

function editLocationP(user,schoolId,homeId){
	var userInfo,school,home;
	userInfo = user.get('userInfo');
	var query = new AV.Query(Location);
	return query.get(schoolId).then(function(result){
		school = result;
		var query = new AV.Query(Location);
		return query.get(homeId);
	}).then(function(result){
		home = result;
		if(userInfo == null){
			userInfo = new UserInfo();
		}else{
			var query = new AV.Query(UserInfo);
			return query.get(userInfo.id);
		}
	}).then(function(result){
		if(result != null){
			userInfo = result;
		}
		var reg = /大学|校区|学校/;
		if(school == null || home == null){
			return AV.Promise.error("没有找到对应的地区");
		}
		if(!reg.test(school.get('locationFullName'))){
			return AV.Promise.error("学校地址不正确");
		}
		userInfo.set("user",user);
		userInfo.set('school',school);
		userInfo.set('home',home);
		return userInfo.save();
	}).then(function(result){
		var info = new UserInfo();
		info.set('id',result.id);
		user.set('userInfo',info);
		return user.save();
	});
}

exports.editLocationP = editLocationP; 