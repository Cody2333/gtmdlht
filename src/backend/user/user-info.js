var AV = require('leanengine');
var UserInfo = AV.Object.extend('UserInfo');
var userRoute = require('express').Router();
var commonRes= require('../common-response');
var discodeMethod = require('../discode/discode');
var routeMethod = require('../route/route');
var userMethod = require('./user');

userRoute.post('/info',function(req,res){
	var user=req.AV.user;
	var query = new AV.Query(UserInfo);
	if(user.get('userInfo') == null){
		res.json({
			err : {
				code :0,
				des : ""
			},
			ret :{
				phone : user.getMobilePhoneNumber(),
			}
		});
	}
	else{
		query.include(['school','home']);
		query.get(user.get('userInfo').id).then(function(userInfo){
			var home = [];
			var school = [];
			if(userInfo.get('school')!=null)
				school.push(userInfo.get('school'));
			if(userInfo.get('home')!=null)
				home.push(userInfo.get('home'));
			res.json({
				err : {
					code:0,
					des:""
				},
				ret :{
					phone : user.getMobilePhoneNumber(),
					school : routeMethod.avLocationToFrontLocation(school)[0],
					home : routeMethod.avLocationToFrontLocation(home)[0]
				}
			});
		},function(error){
			commonRes.unknownError(res,2,error);
		});
	}
});

/*获取用户优惠码
send	:{
			err,
			return : discountCode
		}
*/
userRoute.post('/getDiscountCode',function(req,res){
	var user=req.AV.user;
	var discountCode=user.get("myDiscountCode");
	if(discountCode!=null){
		res.json({
			err :{
				code : 0,
				des : ""
			},
			ret :{
				discountCode : discountCode
			}
		})
	}else{
		discodeMethod.genDiscountCodeForUserP(user).then(function(discode){
			res.json({
				err : {
					code : 0,
					des : ""
				},
				ret : {
					discountCode : discode.get("codeNumber")
				}
			});
		},function(error){
			commonRes.unknownError(res,2,error);
		});
	}
});

userRoute.post('/userId', function(req, res) {
	var user = req.AV.user;
	var id = user.id;
	res.json({
		err: {
			code: 0,
			des: ""
		},
		ret: {
			userId: id.substr(-6)
		}
	});
});


userRoute.post('/editLocation',function(req,res){
	var schoolId = req.body.schoolId;
	var homeId = req.body.homeId;
	var user = req.AV.user;
	userMethod.editLocationP(user,schoolId,homeId).then(function(){
		commonRes.simpleSuccess(res);
	},function(error){
		commonRes.unknownError(res,2,error);
	});
});

module.exports = userRoute;