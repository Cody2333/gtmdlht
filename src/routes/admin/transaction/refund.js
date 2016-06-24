var AV = require('leanengine');
var pingpp = require('pingpp')('sk_live_DxSo7c8WHdbqMoxF8tXk7pg9');
var moment = require('moment');
var timeLine = require('../../../backend/time-line');
var TransactionQuery = AV.Object.extend('TransactionQuery');
var DiscodeMap = AV.Object.extend('DiscountRuleMap');
var Coupon = AV.Object.extend('Coupon');

function refundOrder(tqid) {
	var query = new AV.Query(TransactionQuery);
	var trQuery, order, route;
	return query.get(tqid).then(function (result) {
		trQuery = result;
		if (trQuery.get('state') != 'untreated') {
			return AV.Promise.error('订单已处理，等待ping++回应');
		}
		trQuery.set('state', 'pending');
		trQuery.save();
		return trQuery.get('order').fetch();
	}).then(function (result) {
		order = result;
		return order.get('route').fetch();
	}).then(function (result) {
		route = result;
		var refundAmount;
		if (moment(trQuery.get('createAt')).add(timeLine.refundMoneyDeadline).isAfter(route.get('startTime'))) {
			//退60%的钱,并分发优惠券
			//refundAmount = order.get('priceToPay');
			refundAmount = parseInt(order.get('priceToPay') * 0.6);
			var couponAmount = parseInt(order.get('priceToPay') * 0.4);
		} else {
			//退85%的钱
			//refundAmount = order.get('priceToPay');
			refundAmount = parseInt(order.get('priceToPay') * 0.85);
			var couponAmount = parseInt(order.get('priceToPay') * 0.15);
		}
		trQuery.set('amount', refundAmount);
		trQuery.save();
		pingpp.charges.createRefund(
			trQuery.get('chargeId'),
			{
				amount: refundAmount,
				description: "用户退款"
			},
			function (err, refund) {
				// YOUR CODE
				if (err != null) {
					console.error(err);
				}
			});
		var query = new AV.Query(DiscodeMap);
		query.equalTo('isDeleted', false);
		query.equalTo('type', 'refund');
		return query.find().then(function (result) {
			if (result.length == 0) {
				console.log('未找到退款优惠规则');
				return;
			}
			while (couponAmount > 0) {
				var coupon = new Coupon();
				var start = new Date(0);
				coupon.set('discountRule', result[0].get('discountRule'));
				coupon.set('type', 'refund');
				coupon.set('user', order.get('user'));
				coupon.set('validPrice', result[0].get('validPrice'));
				coupon.set('validStartTime', start);
				if (result[0].get('validTime') != null) {
					coupon.set('validEndTime', moment().add(result[0].get('validTime'), 'ms').toDate());
				}
				coupon.set('isUsed', false);
				coupon.set('isValid', true);
				coupon.set('isDeleted', false);
				if (couponAmount >= 2000) {
					coupon.set('discountPrice', 2000);
					coupon.set('show', '￥' + 20);
					couponAmount -= 2000;
				} else {
					coupon.set('discountPrice', couponAmount);
					coupon.set('show', '￥' + couponAmount/100.0);
					couponAmount = 0;
				}
				coupon.save();
			}
		});


	});
}

exports.refundOrder = refundOrder;