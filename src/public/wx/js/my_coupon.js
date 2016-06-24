var appendCoupon = function(coupon) {
	var divCoupon = $('<div>').addClass('coupon').data('coupon', coupon);
	if (coupon.type === 'refund') {
		divCoupon.addClass('refund');
	}
	var discount = $('<p>').addClass('discount').text(coupon.show);
	divCoupon.append(divCoupon, discount);
	if (coupon.validPrice) {
		var cond = $('<p>').addClass('cond').text('满￥' + coupon.validPrice/100 + '使用');
		divCoupon.append(cond);
	}
	if (coupon.validSrc) {
		var cond = $('<p>').addClass('cond').text('仅限' + coupon.validSrc.name + '发车');
		divCoupon.append(cond);
	}
	if (coupon.validDest) {
		var cond = $('<p>').addClass('cond').text('仅限前往' + coupon.validDest.name + '');
		divCoupon.append(cond);
	}
	var exp = $('<p>').addClass('expiration');
	var iconExp = $('<span>').addClass('icon icon-expiration');
	var start = new Date(coupon.validStartTime);
	var now = new Date();
	if (start > now) {
		var txtExp = $('<span>').addClass('text-expiration').text(formattedDateTime(new Date(coupon.validStartTime))+ '生效');
	} else {
		var txtExp = $('<span>').addClass('text-expiration').text(formattedDateTime(new Date(coupon.validEndTime))+ '失效');
	}
	exp.append(iconExp, txtExp);
	divCoupon.append(exp);
	$('#coupon-list').append(divCoupon);
}

var loadRef = function(done) {
	simplePost('/api/user/getDiscountCode', {}, function(ret) {
		$('#ref').text(ret.discountCode);
		done();
	});
}

var loadCoupon = function() {
	simplePost('/api/coupon/list', {}, function(ret) {
		for (var idx in ret.coupon) {
			var coupon = ret.coupon[idx];
			appendCoupon(coupon);
		}
	});
};

var redeemCoupon = function() {
	var code = $('#code').val();
	simplePost('/api/coupon/redeem', {
		discode: code
	}, function(ret) {
		appendCoupon(ret.coupon);
		$('#code').val('');
	});
};

$(document).ready(function() {
	loadRef(loadCoupon);
	$('#btn-redeem').click(redeemCoupon);
});
