var AV = require('leanengine');
var Discode = AV.Object.extend("DiscountCode");
var Coupon = AV.Object.extend("Coupon");
var DiscodeMap = AV.Object.extend('DiscountRuleMap');
var UserInfo = AV.Object.extend('UserInfo');
var routeMethod = require('../route/route');
var moment = require('moment');
var CommonData= require('./common-data');

//将后台的discountRule转换成前端所用的格式
function avDisRuleToFrontDisRule(disRules) {
	if (disRules == null) {
		return null;
	}
	var results = [];
	for (var i = 0; i < disRules.length; i++) {
		results.push({
			id: disRules[i].id,
			description: disRules[i].get('description'),
			type: disRules[i].get('type'),
			discountFunction: disRules[i].get('disountFunction')
		});
	}
	return results;
}

//后台coupon转换为前端coupons
function avCouponToFrontCoupon(coupons) {
	if (coupons == null) {
		return null;
	}
	var results = [];
	for (var i = 0; i < coupons.length; i++) {
		var validSrc = [];
		var validDest = [];
		var discountRule = [];
		var discodeId = null;
		var orderId = null;
		if (coupons[i].get('discountCode') != null) {
			discodeId = coupons[i].get('discountCode').id;
		}
		if(coupons[i].get('order') != null){
			orderId = coupons[i].get('order').id;
		}
		validSrc.push(coupons[i].get('validSource'));
		validDest.push(coupons[i].get('validDest'));
		discountRule.push(coupons[i].get('discountRule'));
		results.push({
			id: coupons[i].id,
			userId: coupons[i].get('user').id,
			type: coupons[i].get('type'),
			discountCodeId: discodeId,
			orderId : orderId,
			validSrc: routeMethod.avLocationToFrontLocation(validSrc)[0],
			validDest: routeMethod.avLocationToFrontLocation(validDest)[0],
			discountRule: avDisRuleToFrontDisRule(discountRule)[0],
			validStartTime: coupons[i].get('validStartTime'),
			validEndTime: coupons[i].get('validEndTime'),
			validPrice: coupons[i].get('validPrice'),
			discountPrice: coupons[i].get('discountPrice'),
			show: coupons[i].get('show'),
			codeNumber: coupons[i].get('codeNumber')
		});
	}
	return results;
}

function findCouponOfUserP(user) {
	var query = new AV.Query(Coupon);
	var result = new Array();
	query.equalTo('isDeleted', false);
	query.equalTo("user", user);
	query.equalTo("isValid", true);
	query.equalTo("isUsed", false);
	query.include('validSource');
	query.include('validDest');
	query.include('discountRule');
	return query.find().then(function (coupons) {
		for (var i = 0; i < coupons.length; i++) {
			if (checkCouponInTime(coupons[i])) {
				result.push(coupons[i]);
			}
		}
		return new AV.Promise(function (resolve, reject) {
			resolve(result);
		});
	});
}

function checkCouponInTime(coupon) {
	if (coupon == null) {
		return false;
	}
	var validStartTime = coupon.get("validStartTime");
	var now = moment();
	if (validStartTime != null) {
		if (now.isBefore(validStartTime)) {
			coupon.set("isValid", false);
			coupon.save().catch(function (error) {
				console.error(error);
			});
			return false;
		}
	}
	var validEndTime = coupon.get("validEndTime");
	if (validEndTime != null) {
		if (now.isAfter(validEndTime)) {
			coupon.set("isValid", false);
			coupon.save().catch(function (error) {
				console.error(error);
			});
			return false;
		}
	}

	return true;
}


function getCouponByDiscodeP(user, discodeNum) {
	if (user == null) {
		return AV.Promise.error('用户为空');
	}
	if (user.get('myDiscountCode') == discodeNum) {
		return AV.Promise.error('拜托别拿自己的优惠码来领优惠券_(:3 」∠)_');
	}
	var foundInCode = false;
	var discode;
	var coupon;
	var now = moment();
	var query = new AV.Query(Discode);
	query.equalTo('codeNumber', discodeNum);
	query.include('couponValidSource');
	query.include('couponValidDest');
	query.equalTo('isDeleted', false);
	var promise = query.find();
	promise = promise.then(function (results) {
		if (results.length == 0) {
			return;
		}
		discode = results[0];
		if (discode.get('type') == 'member') {
			if (user.get('agentCode') != null) {
				return AV.Promise.error('用户已经获取过同类优惠券');
			}
			user.set('agentCode', discodeNum);
		}
		if (discode.get('validDate') != null) {
			if (now.isAfter(discode.get('validDate'))) {
				return AV.Promise.error('优惠码已过期，不能领取');
			}
		}
		if (discode.get('curNumber') >= discode.get('maxNumber')) {
			return AV.Promise.error('优惠券发放数量达到上限');
		}
		foundInCode = true;
		coupon = new Coupon();
		coupon.set('user', user);
		coupon.set('type', discode.get('type'));
		coupon.set('discountPrice', discode.get('discountPrice'));
		coupon.set('discountRule', discode.get('discountRule'));
		coupon.set('validSource', discode.get('couponValidSource'));
		coupon.set('validDest', discode.get('couponValidDest'));
		coupon.set('validStartTime', discode.get('couponValidStart'));
		coupon.set('validEndTime', discode.get('couponValidEnd'));
		coupon.set('validPrice', discode.get('couponValidPrice'));
		coupon.set('codeNumber', discodeNum);
		coupon.set('show', discode.get('show'));
		coupon.set('isDeleted', false);
		coupon.set('isValid', true);
		coupon.set('isUsed', false);
		discode.increment('curNumber');
		discode.save();
		return coupon.save();
	});
	promise = promise.then(function (coupon) {
		if (foundInCode) {
			return new AV.Promise(function(resolve){
				resolve(coupon);
			});
		}
		if (user.get('agentCode') != null) {
			return AV.Promise.error('用户已领取过相应优惠券');
		}
		var query = new AV.Query(AV.User);
		query.include('agentInfo');
		query.equalTo('myDiscountCode', discodeNum);
		var promise = query.find();
		promise = promise.then(function (results) {
			if (results.length == 0) {
				return AV.Promise.error('未找到对应优惠券');
			}
			var query = new AV.Query(DiscodeMap);
			if (results[0].get('isAgent')) {
				if(results[0].get('agentInfo') == null){
					return AV.Promise.error('该代理还未完善代理信息');
				}
				query.equalTo('type', 'agent');
				var agentInfo = results[0].get('agentInfo');
				if (agentInfo.get('agentSource') != null) {
					query.equalTo('source', agentInfo.get('agentSource'));
				}
				if (agentInfo.get('agentDest') != null) {
					query.equalTo('dest', agentInfo.get('agentDest'));
				}
				user.set('myAgent', results[0]);
			} else {
				query.equalTo('type', 'user');
			}
			query.equalTo('isDeleted', false);
			query.include('validSource');
			query.include('validDest');
			return query.find();
		});
		promise = promise.then(function (results) {
			if (results.length == 0) {
				return AV.Promise.error('未找到对应优惠规则');
			}
			var mapItem = results[0];
			coupon = new Coupon();
			coupon.set('user', user);
			coupon.set('type', mapItem.get('type'));
			coupon.set('discountPrice', 0);
			coupon.set('discountRule', mapItem.get('discountRule'));
			coupon.set('validSource', mapItem.get('validSource'));
			coupon.set('validDest', mapItem.get('validDest'));
			if (mapItem.get('validTime') != null) {
				coupon.set('validEndTime', now.add(mapItem.get('validTime'), 'ms').toDate());
			}
			coupon.set('validPrice', mapItem.get('validPrice'));
			coupon.set('codeNumber', discodeNum);
			coupon.set('show', mapItem.get('show'));
			coupon.set('isDeleted', false);
			coupon.set('isValid', true);
			coupon.set('isUsed', false);
			user.set('agentCode', discodeNum);
			user.save();
			return coupon.save();
		});
		return promise;
	});
	return promise;
}

function paybackCouponToUserP(coupon) {
	if (coupon.get('type') != 'user') {
		return AV.Promise.error('this coupon type is not user coupon');
	}
	var discountRule;
	var query = new AV.Query(DiscodeMap);
	query.equalTo('type', 'user');
	query.equalTo('isDeleted', false);
	return query.find().then(function (result) {
		if (result.length == 0) {
			return AV.Promise.error('not find the discount rule');
		}
		discountRule = result[0];
		var query = new AV.Query(AV.User);
		query.equalTo('myDiscountCode', coupon.get('codeNumber'));
		return query.find();
	}).then(function (srcUser) {
		var paybackCoupon;
		paybackCoupon.set('user', srcUser);
		paybackCoupon.set('type', discountRule.get('type'));
		paybackCoupon.set('discountPrice', 0);
		paybackCoupon.set('discountRule', discountRule.get('discountRule'));
		paybackCoupon.set('validSource', discountRule.get('validSource'));
		paybackCoupon.set('validDest', discountRule.get('validDest'));
		if (discountRule.get('validTime') != null) {
			paybackCoupon.set('validEndTime', moment().add(discountRule.get('validTime'), 'ms').toDate());
		}
		paybackCoupon.set('codeNumber', coupon.get('codeNumber'));
		paybackCoupon.set('isDeleted', false);
		paybackCoupon.set('isValid', false);
		paybackCoupon.set('isUsed', false);
		return paybackCoupon.save();
	});
}

/**
 * 获取新用户优惠券，根据学校地址与家里地址计算出路线长度，然后查找对应优惠码
 */

function getBeginnerCouponP(user){
	var userInfo = user.get('userInfo');
	if(userInfo == null){
		return AV.Promise.error('还未完善用户信息');
	}
	var query = new AV.Query(UserInfo);
	var school,home,info;
	query.include(['school','home']);
	return query.get(userInfo.id).then(function(result){
		info=result;
		if(info.get('beginnerCoupon')!=null){
			return AV.Promise.error('已领取新用户优惠券');
		}
		if(info.get('school') == null || info.get('home') == null){
			return AV.Promise.error('还未完善用户信息');
		}
		school = info.get('school');
		home = info.get('home');
		var deltLng = school.get('lng') - home.get('lng');
		var deltLat = school.get('lat') - home.get('lat');
		var length = deltLng*111000;
		var lng = school.get('lng');
		var width = deltLat*111000*Math.cos(lng*0.01745);
		var distance = Math.sqrt(length*length+width*width);
		var i;
		for(i=0;i<CommonData.distance.length;i++){
			if(distance<CommonData.distance[i]){
				break;
			}
		}
		var discode = CommonData.beginnerCodes[i];
		var query = new AV.Query(Discode);
		query.equalTo('isDeleted',false);
		query.equalTo('codeNumber',discode);
		return query.find();
	}).then(function(result){
		if(result.length == 0){
			return AV.Promise.error('没有对应优惠码');
		}
		var discode = result[0];
		var now = moment();
		if (discode.get('validDate') != null) {
			if (now.isAfter(discode.get('validDate'))) {
				return AV.Promise.error('优惠码已过期，不能领取');
			}
		}
		var coupon = new Coupon();
		coupon.set('user', user);
		coupon.set('type', discode.get('type'));
		coupon.set('discountPrice', discode.get('discountPrice'));
		coupon.set('discountRule', discode.get('discountRule'));
		coupon.set('validSource', school);
		coupon.set('validDest', home);
		coupon.set('validPrice', discode.get('couponValidPrice'));
		coupon.set('codeNumber', discode.get('codeNumber'));
		coupon.set('show', discode.get('show'));
		coupon.set('isDeleted', false);
		coupon.set('isValid', true);
		coupon.set('isUsed', false);
		discode.increment('curNumber');
		discode.save();
		return coupon.save();
	}).then(function(coupon){
		info.set('beginnerCoupon',coupon);
		info.save();
		return new AV.Promise(function(resolve,reject){
			resolve(coupon);
		})
	});
}

exports.getCouponByDiscodeP = getCouponByDiscodeP;
exports.findCouponOfUserP = findCouponOfUserP;
exports.checkCouponInTime = checkCouponInTime;
exports.avCouponToFrontCoupon = avCouponToFrontCoupon;
exports.paybackCouponToUserP = paybackCouponToUserP;
exports.getBeginnerCouponP = getBeginnerCouponP;