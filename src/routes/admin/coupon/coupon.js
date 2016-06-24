var AV = require('leanengine');
var locationMethods = require('../location/location');
var userMethods = require('../user/user');

var Coupon = AV.Object.extend('Coupon');
var DiscountRule = AV.Object.extend('DiscountRule');
var DiscountRuleMap = AV.Object.extend('DiscountRuleMap');
var DiscountCode = AV.Object.extend('DiscountCode');
var Location = AV.Object.extend('Location');
var User = AV.User;

function packupDiscountRule(discountRule) {
	var result = {};
	result.id = discountRule.id;
	result.description = discountRule.get('description');
	result.validSrc = locationMethods.packup(discountRule.get('validSource'));
	result.validDest = locationMethods.packup(discountRule.get('validDest'));
	result.validPrice = discountRule.get('validPrice');
	result.discountFunction = discountRule.get('discountFunction');

	return result;
}

function packupDiscountRuleMap(discountRuleMap) {
	var result = {};
	result.id = discountRuleMap.id;
	result.show = discountRuleMap.get('show');
	result.src = locationMethods.packup(discountRuleMap.get('source'));      
	result.dest = locationMethods.packup(discountRuleMap.get('dest'));
	result.validSrc = locationMethods.packup(discountRuleMap.get('validSource'));
	result.validDest = locationMethods.packup(discountRuleMap.get('validDest'));
	result.validPrice = discountRuleMap.get('validPrice');
	result.validTime = discountRuleMap.get('validTime');
	result.discountRule = packupDiscountRule(discountRuleMap.get('discountRule'));

	return result;
}

function packupDiscountCode(discountCode) {
	var result = {};
	result.id = discountCode.id;
	result.name = discountCode.get('name');
	result.show = discountCode.get('show');
	result.discountRule = packupDiscountRule(discountCode.get('discountRule'));
	result.code = discountCode.get('codeNumber');
	if (discountCode.get('validDate') == null) {
		result.validDate = null;
	}
	else {
		result.validDate = discountCode.get('validDate').getTime();
	}
	result.couponValidPrice = discountCode.get('couponValidPrice');
	result.couponValidSrc = locationMethods.packup(discountCode.get('couponValidSource'));
	result.couponValidStartTime = getNewTime(discountCode.get('couponValidStart'));
	result.couponValidEndTime = getNewTime(discountCode.get('couponValidEnd'));
	result.curNumber = discountCode.get('curNumber');
	return result;
}

function getDiscountRuleList(skip, limit) {
	var discountRuleQuery = new AV.Query(DiscountRule);

	if (skip != null) {
		discountRuleQuery.skip(skip);
	}
	if (limit != null) {
		discountRuleQuery.limit(limit);
	}

	discountRuleQuery.equalTo('isDeleted', false);
	discountRuleQuery.equalTo('type', 'normal');
	discountRuleQuery.include('validSource');

	return discountRuleQuery.find();
}

function getDiscountRuleMapList(skip, limit) {
	var discountRuleMapQuery = new AV.Query(DiscountRuleMap);

	if (skip != null) {
		discountRuleMapQuery.skip(skip);
	}
	if (limit != null) {
		discountRuleMapQuery.limit(limit);
	}
	discountRuleMapQuery.equalTo('type', 'agent');
	discountRuleMapQuery.equalTo('isDeleted', false);

	discountRuleMapQuery.include('source');
	discountRuleMapQuery.include('validSource');
	discountRuleMapQuery.include('discountRule');

	return discountRuleMapQuery.find();
}

function getUserDiscountRuleMap() {
	var discountRuleMapQuery = new AV.Query(DiscountRuleMap);

	discountRuleMapQuery.equalTo('type', 'user');
	discountRuleMapQuery.equalTo('isDeleted', false);

	discountRuleMapQuery.include('validSource');
	discountRuleMapQuery.include('discountRule');

	return discountRuleMapQuery.find();
}

function getDiscountCodeList(skip, limit) {
	var discountCodeQuery = new AV.Query(DiscountCode);

	if (skip != null) {
		discountCodeQuery.skip(skip);
	}
	if (limit != null) {
		discountCodeQuery.limit(limit);
	}
	discountCodeQuery.equalTo('isDeleted', false);

	discountCodeQuery.include('discountRule');
	discountCodeQuery.include('couponValidSource');

	return discountCodeQuery.find();
}

function addDiscountRule(description, discountFunction) {
	var discountRule = new DiscountRule();
	discountRule.set('description', description);
	discountRule.set('type', 'normal');
	discountRule.set('discountFunction', discountFunction);
	discountRule.set('isDeleted', false);

	return discountRule.save();
}

function addDiscountRuleMap(srcId, show, discountRuleId, validSrcId, validPrice, validTime) {
	var discountRuleMapQuery = new AV.Query(DiscountRuleMap);
	var discountRuleMap = new DiscountRuleMap();
	var discountRule = new DiscountRule();
	var src = getNewLocation(srcId);
	var validSrc = getNewLocation(validSrcId);

	discountRule.id = discountRuleId;

	if (validPrice == null) {
		validPrice = 0;
	}
	if (validTime == 0) {
		validTime = 200 * 24 * 60 * 60 * 1000;
	}


	discountRuleMap.set('show', show);
	discountRuleMap.set('source', src);
	discountRuleMap.set('validSource', validSrc);
	discountRuleMap.set('discountRule', discountRule);
	discountRuleMap.set('validTime', validTime);
	discountRuleMap.set('validPrice', validPrice);
	discountRuleMap.set('type', 'agent');
	discountRuleMap.set('isDeleted', false);

	discountRuleMapQuery.equalTo('source', src);
	discountRuleMapQuery.equalTo('type', 'agent');
	discountRuleMapQuery.equalTo('isDeleted', false);

	return discountRuleMapQuery.find()
	.then(function(results) {
		if (results.length != 0) {
			return AV.Promise.error('该地点对应的规则已经存在');
		}
		return discountRuleMap.save();
	});
}

function addDiscountCode(name, show, code, validDate, couponValidPrice, couponValidSrcId, couponValidStartTime, couponValidEndTime, discountRuleId) {
	var userQuery = new AV.Query(User);
	var discountCode = new DiscountCode();
	var discountCodeQuery = new AV.Query(DiscountCode);
	var couponValidSrc = getNewLocation(couponValidSrcId);
	var discountRule = new DiscountRule();
	discountRule.id = discountRuleId;

	if (name == null || discountRule == null || show == null) {
		return AV.Promise.error('请检查输入');
	}
	if (checkCodeValid(code) == false) {
		return AV.Promise.error('优惠码格式不正确');
	}
	if(validDate == null) {
		var now = new Date();
		now.setFullYear(2020);
		validDate = now.getTime();
	}
	if(couponValidEndTime == null) {
		var now = new Date();
		now.setFullYear(2020);
		couponValidEndTime = now.getTime();
	}
	if (couponValidStartTime == null) {
		var begin = new Date(0);
		couponValidStartTime = begin.getTime();
	}
	if (couponValidPrice == null) {
		couponValidPrice = 0;
	}
	userQuery.equalTo('myDiscountCode', code);
	userQuery.equalTo('isDeleted', false);

	return userQuery.find()
	.then(function(results) {
		if (results.length != 0) {
			return AV.Promise.error('与用户优惠码');
		}
		discountCodeQuery.equalTo('codeNumber', code);
		discountCodeQuery.equalTo('isDeleted', false);
		return discountCodeQuery.find();
	})
	.then(function(results) {
		if (results.length != 0) {
			return AV.Promise.error('地推优惠码重复');
		}
		discountCode.set('name', name);
		discountCode.set('show', show);
		discountCode.set('codeNumber', code);
		discountCode.set('validDate', getNewDate(validDate));
		discountCode.set('couponValidPrice', couponValidPrice);
		discountCode.set('couponValidSource', couponValidSrc);
		discountCode.set('couponValidStart', getNewDate(couponValidStartTime));
		discountCode.set('couponValidEnd', getNewDate(couponValidEndTime));
		discountCode.set('discountRule', discountRule);
		discountCode.set('isDeleted', false);
		discountCode.set('type', 'member');
		discountCode.set('curNumber', 0);

		return discountCode.save()
	});
}

function updateDiscountRuleMap(discountRuleMapId, show, discountRuleId, validSrcId, validPrice, validTime) {
	var discountRuleMap = new DiscountRuleMap();
	var discountRule = new DiscountRule();
	var validSrc = getNewLocation(validSrcId);

	discountRuleMap.id = discountRuleMapId;
	discountRule.id = discountRuleId;

	if (validTime == 0) {
		validTime = 200 * 24 * 60 * 60 * 1000; //200 days
	}
	if (validPrice == null) {
		validPrice = 0;
	}


	discountRuleMap.set('show', show);
	discountRuleMap.set('validSource', validSrc);
	discountRuleMap.set('discountRule', discountRule);
	discountRuleMap.set('validTime', validTime);
	discountRuleMap.set('validPrice', validPrice);

	return discountRuleMap.save();
}

function updateDiscountCode(discountCodeId, show, validDate, couponValidPrice, couponValidSrcId, couponValidStartTime, couponValidEndTime, discountRuleId) {
	var discountCode = new DiscountCode();
	var discountRule = new DiscountRule();
	var couponValidSrc = getNewLocation(couponValidSrcId);
	discountCode.id = discountCodeId;
	discountRule.id = discountRuleId;

	if(couponValidEndTime == null) {
		var now = new Date();
		now.setFullYear(2020);
		couponValidEndTime = now.getTime();
	}
	if (couponValidStartTime == null) {
		var begin = new Date(0);
		couponValidStartTime = begin.getTime();
	}
	if (couponValidPrice == null) {
		couponValidPrice = 0;
	}

	discountCode.set('show', show);
	discountCode.set('validDate', getNewDate(validDate));
	discountCode.set('couponValidPrice', couponValidPrice);
	discountCode.set('couponValidSource', couponValidSrc);
	discountCode.set('couponValidStart', getNewDate(couponValidStartTime));
	discountCode.set('couponValidEnd', getNewDate(couponValidEndTime));
	discountCode.set('discountRule', discountRule);

	return discountCode.save();
}

function distributeCoupons(show, discountRuleId, validSrcId, validDestId, validPrice, validEndTime) {
	var userQuery = new AV.Query(User);
	var coupon = new Coupon();
	var discountRule = new DiscountRule();
	var validSrc = getNewLocation(validSrcId);
	var validDest = getNewLocation(validDestId);
	var validEndTime = getNewDate(validEndTime);

	if (validEndTime == null) {
		validEndTime = new Date();
		validEndTime.setFullYear(2020);
	}

	discountRule.id = discountRuleId;

	return userMethods.getUserList(0, 1000)
	.then(function(results) {
		var promises = [];
		for (var i = 0; i < results.length; i++) {
			var coupon = new Coupon();
			var user = new User();
			user.id = results[i].id;

			coupon.set('show', show);
			coupon.set('user', user);
			coupon.set('type', 'public');
			coupon.set('discountRule', discountRule);
			coupon.set('validSource', validSrc);
			coupon.set('validDest', validDest);
			coupon.set('validPrice', validPrice);
			coupon.set('validEndTime', validEndTime);
			coupon.set('validStartTime', new Date(0));
			coupon.set('isUsed', false);
			coupon.set('isValid', true);
			coupon.set('isDeleted', false);
			promises.push(coupon.save());
		}
		return new AV.Promise.when(promises);
	});
}

function donateCoupon(users, show, discountRuleId) {
	var coupon = new Coupon();
	var discountRule = new DiscountRule();
	var validStartTime = new Date(0);
	var validEndTime = new Date();
	var uniqueUsers = getUniqueArray(users);

	validEndTime.setFullYear(2020);
	discountRule.id = discountRuleId;

	var promises = [];
	for (var i = 0; i < uniqueUsers.length; i++) {
		var user = new User();
		user.id = uniqueUsers[i].id;

		coupon.set('show', show);
		coupon.set('user', user);
		coupon.set('type', 'public');
		coupon.set('discountRule', discountRule);
		coupon.set('validPrice', 0);
		coupon.set('validEndTime', validEndTime);
		coupon.set('validStartTime', validStartTime);
		coupon.set('isUsed', false);
		coupon.set('isValid', true);
		coupon.set('isDeleted', false);
		promises.push(coupon.save());
	}
	return new AV.Promise.all(promises);
}


function checkCodeValid(code) {
	var patt=new RegExp("[0-9a-z]{6}");
	return patt.test(code);
}

function getNewLocation(id) {
	if (id == null) {
		return null;
	}
	else {
		var location = new Location();
		location.id = id;
		return location;
	}
}

function getNewTime(date) {
	if (date == null) {
		return null;
	}
	else {
		return date.getTime();
	}
}

function getNewDate(date) {
	if (date == null) {
		return null;
	}
	else {
		return new Date(date);
	}
}

function getUniqueArray(items) {
	var uniqueItems = [];
    for (var i = 0; i < items.length; i++) {
        if (uniqueItems.indexOf(items[i]) == -1) {
            uniqueItems.push(items[i]);
        }
    }
    return uniqueItems;
}

exports.packupDiscountRule = packupDiscountRule;
exports.packupDiscountRuleMap = packupDiscountRuleMap;
exports.packupDiscountCode = packupDiscountCode;
exports.packupDiscountCode = packupDiscountCode;
exports.getDiscountRuleList = getDiscountRuleList;
exports.getDiscountRuleMapList = getDiscountRuleMapList;
exports.getUserDiscountRuleMap = getUserDiscountRuleMap;
exports.getDiscountCodeList = getDiscountCodeList;
exports.addDiscountRule = addDiscountRule;
exports.addDiscountRuleMap = addDiscountRuleMap;
exports.addDiscountCode = addDiscountCode;
exports.updateDiscountRuleMap = updateDiscountRuleMap;
exports.updateDiscountCode = updateDiscountCode;
exports.distributeCoupons = distributeCoupons;
exports.donateCoupon = donateCoupon;