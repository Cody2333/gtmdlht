var AV = require('leanengine');
var commonRes = require('./common-response');
var moment = require('moment');

var ensureLogin = function (req, res, next){
	if(req.AV.user != null){		//如果已经登录则继续
		next();
	}else{
		var openId = req.session.wxOpenid;	//获取openid
		if(openId == null){
			commonRes.notLoginError(res,1);
			return;
		}
		var query = new  AV.Query(AV.User);
		query.equalTo("wxOpenId",openId);	//用openid查找到用户然后登录
		query.find().then(function(result){
			if(result.length == 0){
				return AV.Promise.error("未找到用户");
			}else{
				return AV.User.logInWithMobilePhone(result[0].get("mobilePhoneNumber"),commonRes.commonPass);
			}
		}).then(function(user){
			req.session.phoneLogin = true;
			req.session.time = moment().valueOf();
			next();
		},function(error){
			commonRes.unknownError(res,2,error);
		});
	}
}

module.exports = ensureLogin;
