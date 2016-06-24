var loaded = {
	passenger: false,
	coupon: false,
	toknow: false
}
var psgList, couponList, route;

var appendPassenger = function(psgId, psgName, psgPhone, psgIdnum) {
	var divPsg = $('<div>').addClass('entry icon-entry fold-entry check-entry');
	var icon = $('<span>').addClass('icon-addon icon-psg1');
	var name = $('<span>').addClass('entry-main').text(psgName);
	var checkbox = $('<div>').addClass('checkbox').click(checkboxHandler).data('pid', psgId);
	var fold = $('<span>').addClass('fold-addon');
	divPsg.append(icon, name, checkbox, fold);
	var detail = $('<div>').addClass('content hidden');
	var mobile = $('<div>').addClass('text-3').text('手机号：' + psgPhone);
	var idnum = $('<div>').addClass('text-3').text('身份证：' + psgIdnum);
	detail.append(mobile, idnum);
	bindFold(divPsg, detail);
	$('#passenger-list').append(divPsg, detail);
}

var showPassenger = function() {
	if (loaded.passenger) {
		pager.switchTo('page-psg', '选择乘客');
	} else {
		simplePost('/api/passenger/list', {}, function(ret) {
			for (var idx in ret.passengers) {
				var psg = ret.passengers[idx];
				appendPassenger(psg.id, psg.name, psg.phone, psg.idnum);
			}
			loaded.passenger = true;
			pager.switchTo('page-psg', '选择乘客');
		});
	}
}

var appendCoupon = function(coupon) {
	var divCoupon = $('<div>').addClass('coupon').data('coupon', coupon).click(selectCoupon);
	if (coupon.type === 'refund') {
		divCoupon.addClass('refund');
	}
	var discount = $('<div>').addClass('discount').text(coupon.show);
	divCoupon.append(divCoupon, discount);
	if (coupon.validPrice) {
		var cond = $('<div>').addClass('cond').text('满￥' + coupon.validPrice/100 + '使用');
		if (route.price * psgList.length < coupon.validPrice) {
			divCoupon.addClass('adisabled');
		}
		divCoupon.append(cond);
	}
	if (coupon.validSrc) {
		var cond = $('<div>').addClass('cond').text('仅限' + coupon.validSrc.name + '发车');
		if (route.src.id != coupon.validSrc.id) {
			divCoupon.addClass('adisabled');
		}
		divCoupon.append(cond);
	}
	if (coupon.validDest) {
		var cond = $('<div>').addClass('cond').text('仅限前往' + coupon.validDest.name);
		if (route.dest.id != coupon.validDest.id) {
			divCoupon.addClass('adisabled');
		}
		divCoupon.append(cond);
	}
	var exp = $('<div>').addClass('expiration');
	var iconExp = $('<span>').addClass('icon-expiration');
	var start = new Date(coupon.validStartTime);
	var now = new Date();
	if (start > now) {
		var txtExp = $('<span>').addClass('text-expiration').text(formattedDateTime(new Date(coupon.validStartTime))+ '生效');
		divCoupon.addClass('adisabled');
	} else {
		var txtExp = $('<span>').addClass('text-expiration').text(formattedDateTime(new Date(coupon.validEndTime))+ '失效');
	}exp.append(iconExp, txtExp);
	divCoupon.append(exp);
	$('#coupon-list').append(divCoupon);
}

var showAddPassenger = function() {
	pager.switchTo('page-add-psg', '添加乘客');
}

var showCoupon = function() {
	var checkedPsgs = $('.checkbox.checked');
	psgList = [];
	for (var idx = 0; idx < checkedPsgs.length; ++idx) {
		var psg = $(checkedPsgs[idx]);
		psgList.push(psg.data('pid'));
	}
	if (psgList.length == 0) {
		alert('至少得有个乘客吧');
		return;
	}
	if (loaded.coupon) {
		pager.switchTo('page-coupon', '选择优惠券');
	} else {
		simplePost('/api/coupon/list', {}, function(ret) {
			for (var idx in ret.coupon) {
				var coupon = ret.coupon[idx];
				appendCoupon(coupon);
			}
			pager.switchTo('page-coupon', '选择优惠券');
			loaded.coupon = true;
		});
	}
}

var selectCoupon = function() {
	var t = $(this);
	if (t.hasClass('disabled') || t.hasClass('adisabled')) {
		return;
	}
	t.toggleClass('selected');
	if (t.hasClass('selected')) {
		if (t.hasClass('refund')) {
			$('.coupon.refund').not(t).addClass('disabled');
		} else {
			$('.coupon:not(.refund)').not(t).addClass('disabled');
		}
	} else {
		if (t.hasClass('refund')) {
			$('.coupon.refund').removeClass('disabled');
		} else {
			$('.coupon:not(.refund)').removeClass('disabled');
		}
	}
}

var confirmOrder = function() {
	var couponList = [];
	var coupons = $('.coupon.selected');
	for (var idx = 0; idx < coupons.length; ++idx) {
		couponList.push($(coupons[idx]).data('coupon').id);
	}
	simplePost('/api/order/countPrice', {
		routeId: route.id,
		passengersId: JSON.stringify(psgList),
		couponsId: JSON.stringify(couponList)
	}, function(ret) {
		var c = confirm('您即将为' + psgList.length + '位乘客购买\n从【' + route.src.fullName + '】\n到【' + route.dest.fullName + '】\n的巴士车票\n总价：【￥' + ret.price/100 + '】\n\n\n是否确定');
		if (c) {
			simplePost('/api/order/create', {
				routeId: route.id,
				passengersId: JSON.stringify(psgList),
				couponsId: JSON.stringify(couponList)
			}, function(ret) {
				alert('下单成功，请及时付款');
				window.location.href = prefix + '/my/order/' + ret.order.id;
			});
		}
	});
}

var addPassenger = function() {

	if (!/.{2,10}/.test($('#name').val())) {
		alert('姓名不正确');
		return false;
	} else if (!/\d{11}/.test($('#phone').val())) {
		alert('手机号不正确');
		return false;
	} else if (!/\d{17}[\dxX]/.test($('#idnum').val())) {
		alert('身份证号不正确');
		return false;
	}

	var name = $('#name').val();
	var phone = $('#phone').val();
	var idnum = $('#idnum').val();


	simplePost('/api/passenger/add', {
		name: name,
		phone: phone,
		idnum: idnum
	}, function(ret) {
		alert('添加成功');
		appendPassenger(ret.passengerId, name, phone, idnum);
		history.back();
	});
};

var loadRoute = function() {
	simplePost('/api/route/view', {
		id: routeId
	}, function(ret) {
		route = ret.route;
		var dept = new Date(route.startTime);
		$('#src').text(route.src.name);
		$('#dest').text(route.dest.name);
		$('#schedule').text(formattedDateTime(dept));
		$('#dept').text(formattedTime(dept));
		$('#price').text(route.price/100)
		$('#personsPaid').text(route.personsPaid);
		$('#content-detail').text(route.notice);
	});
}

var showToknow = function() {
	if (loaded.toknow) {
		pager.switchTo('page-toknow', '乘客须知');
	} else {
		simpleGet('/wx/TOKNOW.txt', function(data) {
			$('#toknow').text(data);
			pager.switchTo('page-toknow', '乘客须知');
			loaded.toknow = true;
		});
	}
};

$(document).ready(function() {
	pager.init('page-schedule');
	bindFold($('#fold-detail'), $('#content-detail'));
	$('#fold-notice').click(showToknow);
	$('#btn-join').click(showPassenger);
	$('#btn-add-psg').click(showAddPassenger);
	$('#btn-create2').click(addPassenger);
	$('#btn-coupon').click(showCoupon);
	$('#btn-review').click(confirmOrder);
	$('.checkbox').click(checkboxHandler);
	loadRoute();
});
