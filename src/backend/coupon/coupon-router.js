var coupon= require('express').Router();
var AV = require('leanengine');
var commonRes = require('../common-response');
var couponMethod = require('./coupon');
coupon.post('/redeem',function(req,res){
	var user=req.AV.user;
	var discode=req.body.discode;
	if(discode==null){
		res.json({
			err : {
				code : 3,
				des : '优惠码为空'
			}
		});
		return;
	}else{
		couponMethod.getCouponByDiscodeP(user,discode).then(function(coupon){
			var coupons = [];
			coupons.push(coupon);
			res.json({
				err : {
					code : 0,
					des : ""
				},
				ret : {
					coupon : couponMethod.avCouponToFrontCoupon(coupons)[0]
				}
			});
		},function(error){
			commonRes.unknownError(res,2,error);
		});
	}
});

coupon.post('/list',function(req,res){
	var user=req.AV.user;
	couponMethod.findCouponOfUserP(user).then(function(results){
		res.json({
			err : {
				code : 0,
				des : ""
			},
			ret : {
				coupon : couponMethod.avCouponToFrontCoupon(results)
			}
		});
	},function(error){
		commonRes.unknownError(res, 2, error);
	});
});

coupon.post('/getBeginnerCoupon',function(req,res){
	var user = req.AV.user;
	couponMethod.getBeginnerCouponP(user).then(function(result){
		var coupons = [];
		if(result != null){
			coupons.push(result);
		}
		res.json({
			err : {
				code : 0,
				des : ""
			},
			ret : {
				coupon : couponMethod.avCouponToFrontCoupon(coupons)[0]
			}
		});
	},function(error){
		commonRes.unknownError(res,2,error);
	});
});

/*coupon.get('/getCouponTest',function(req,res){
	var userId=req.query.userId;
	var discode=req.query.discode;
	if(userId==null||discode==null){
		console.log("need more params");
		res.send("need more params");
		return;
	}else{
		var userQ=new AV.Query(AV.User);
		userQ.get(userId).then(function(user){
			couponMethod.getCouponByDiscode(user,discode,function(error){
				if(error==null){
					res.send("ok");
				}else{
					res.send(error);
				}
			});
			return;
		},function(error){
			console.error(error);
		});
		
	}
});*/

module.exports = coupon;