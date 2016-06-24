var router = require('express').Router();
var couponMethods = require('./coupon');
var smsMethods = require('../sms/sms_m');

router.post('/discountRuleList', function(req, res) {
	var discountRules = new Array();
	couponMethods.getDiscountRuleList(req.body.skip, req.body.limit)
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			discountRules.push(couponMethods.packupDiscountRule(results[i]));
		}
		res.send({status: 'success', data: discountRules});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/discountRuleMapList', function(req, res) {
	var discountRuleMaps = new Array();
	couponMethods.getDiscountRuleMapList(req.body.skip, req.body.limit)
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			discountRuleMaps.push(couponMethods.packupDiscountRuleMap(results[i]));
		}
		res.send({status: 'success', data: discountRuleMaps});
	}, function(err) {
		res.send({status: 'error', data: err});
	})
});

router.post('/userDiscountRuleMap', function(req, res) {
	couponMethods.getUserDiscountRuleMap()
	.then(function(results) {
		if (results.length != 1)
			res.send({status: 'error', data: 'not find or find too much'});
		else
			res.send({status: 'success', data: couponMethods.packupDiscountRuleMap(results[0])})
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/discountCodeList', function(req, res) {
	var discountCodes = new Array();
	couponMethods.getDiscountCodeList(req.body.skip, req.body.limit)
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			discountCodes.push(couponMethods.packupDiscountCode(results[i]));
		}
		res.send({status: 'success', data: discountCodes});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/distribute', function(req, res) {
	couponMethods.distributeCoupons(req.body.show, req.body.discountRuleId, req.body.validSrcId, req.body.validDestId, req.body.validPrice, req.body.validEndTime)
	.then(function() {
		res.send({status: 'success'});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/addDiscountRule', function(req, res) {
	couponMethods.addDiscountRule(req.body.description, req.body.discountFunction)
	.then(function() {
		res.send({status: 'success'});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/addDiscountRuleMap', function(req, res) {
	couponMethods.addDiscountRuleMap(req.body.srcId, req.body.show, req.body.discountRuleId, req.body.validSrcId, req.body.validPrice, req.body.validTime)
	.then(function() {
		res.send({status: 'success'});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/addDiscountCode', function(req, res) {
	couponMethods.addDiscountCode(req.body.name, req.body.show, req.body.code, req.body.validDate, req.body.couponValidPrice, req.body.couponValidSrcId, 
		req.body.couponValidStartTime, req.body.couponValidEndTime, req.body.discountRuleId)
	.then(function() {
		res.send({status: 'success'});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/updateDiscountRuleMap', function(req, res) {
	couponMethods.updateDiscountRuleMap(req.body.discountRuleMapId, req.body.show, req.body.discountRuleId, req.body.validSrcId, req.body.validPrice, req.body.validTime)
	.then(function() {
		res.send({status: 'success'});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/updateDiscountCode', function(req, res) {
	couponMethods.updateDiscountCode(req.body.discountCodeId, req.body.show, req.body.validDate, req.body.couponValidPrice, req.body.couponValidSrcId,
		req.body.couponValidStartTime, req.body.couponValidEndTime, req.body.discountRuleId)
	.then(function() {
		res.send({status: 'success'});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/donate', function(req, res) {
	couponMethods.donateCoupon(req.body.users, req.body.show, req.body.discountRuleId)
	.then(function() {
		var phones = [];
		for (var i = 0; i < req.body.users.length; i++) {
			phones.push(req.body.users[i].phone);
		}
		var params = {show: req.body.show};
		return smsMethods.sendSms(phones, 'couponSmsV2', params);
	})
	.then(function() {
		res.send({status: 'success'});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

module.exports = router;