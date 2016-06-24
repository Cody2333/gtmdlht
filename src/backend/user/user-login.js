var AV = require('leanengine');
var userRoute = require('express').Router();
var commonRes= require('../common-response');
var moment = require('moment');

/*发送手机验证码
params	:phone
send	:err|success
*/
userRoute.post("/prelogin",function(req,res){
	var phone=req.body.phone;
	if(phone==null){
		res.json({
			err : {
				code : 1 ,
				des : "后台没有收到手机号"
			}
		});
		return;
	}
	AV.Cloud.requestSmsCode(phone).then(function(){
  		//发送成功
		  commonRes.simpleSuccess(res);
		}, function(err){
  		//发送失败
		  commonRes.unknownError(res,2,err);
	});
});

/*验证码登陆
params	:phone, code
send	:err|success
*/
userRoute.post("/login",function(req,res){
	var phone = req.body.phone;
	var code = req.body.code;
	var user = new AV.User();
	var wxOpenId = req.session.wxOpenid;
	console.log("login user :"+phone+"\t"+wxOpenId);
	user.signUpOrlogInWithMobilePhone({
		mobilePhoneNumber : phone,
		smsCode : code,
		wxOpenId : wxOpenId,
		password : commonRes.commonPass
	}).then(function(result){
		req.session.phoneLogin = true;
		req.session.time = moment().valueOf();
		console.log('user :'+result.get('mobilePhoneNumber')+ '\topenId:'+wxOpenId);
		result.set('wxOpenId', wxOpenId);
		result.set('password', commonRes.commonPass);
		result.save();
		commonRes.simpleSuccess(res);
	},function(error){
		commonRes.unknownError(res,2,error);
	});
});

/*退出登录 */
userRoute.get('/logout',function(req,res){
	var user = req.AV.user;
	if(user != null){
		user.set('wxOpenId',null);
		user.save().then(function(){
			req.session.destroy();
			AV.User.logOut();
			res.end('退出成功');
		},function(error){
			res.end('退出失败');
		});
	}
});

userRoute.post('/test',function(req,res){
	var phone = req.body.phone;
	AV.User.logInWithMobilePhone(phone,commonRes.commonPass).then(function(user){
		commonRes.simpleSuccess(res);
	},function(error){
		commonRes.unknownError(res,2,error);
	});
});

userRoute.post('/test2',function(req,res){
	var username = req.body.username;
	var query = new AV.Query(AV.User);
	query.equalTo('username',username);
	query.find().then(function(users){
		if(users.length == 0){
			return AV.Promise.error('not find the user');
		}else{
			return AV.User.logInWithMobilePhone(users[0].get('mobilePhoneNumber'),commonRes.commonPass);
		}
	}).then(function(user){
		commonRes.simpleSuccess(res);
	},function(error){
		commonRes.unknownError(res,2,error);
	});
});

userRoute.post('/test3',function(req,res){
	var phone = req.body.phone;
	var password = req.body.password;
	console.log(phone+':'+password);
	AV.User.logInWithMobilePhone(phone,password).then(function(user){
		commonRes.simpleSuccess(res);
	},function(error){
		commonRes.unknownError(res,2,error);
	});
});

module.exports=userRoute;
