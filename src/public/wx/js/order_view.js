var order;
var loaded = {
	agreement: false,
	toknow: false
}

var payHandler = function() {
	simplePost('/api/order/pay', {
		orderId: order.id,
		channel: 'wx_pub'
	}, function(ret) {
		pingpp.createPayment(ret.charge, function(result, error){
			if (result == "success") {
				window.location.href = prefix + '/my/order/' + order.id + '/paid';
			} else if (result == "fail") {
				alert('支付失败！');
			}
		});
	});
}

var cancelHandler = function() {
	var c = confirm('注意：\n开车前1小时内不予退款\n开车前24小时内退还60%现金+40%用车抵用券\n开车前24时外退还85%现金+15%用车抵用券\n\n您确定要退款吗？');
	if (c) {
		simplePost('/api/order/cancel', {
			orderId: order.id
		}, function(ret) {
			alert('您的退款请求已提交，请耐心等待结果');
			$('#btn-pay').hide();
			$('#btn-cancel').hide();
			$('#state').text('正在取消').show();
		});
	}
}

var findTicket = function(pid) {
	for (idx in order.tickets) {
		var ticket = order.tickets[idx];
		if (ticket.passenger.id === pid) {
			return ticket;
		}
	}
	return null;
}

var boardHandler = function() {
	var tid = $(this).data('tid');
	var c = confirm('您确定要检票上车吗？');
	if (c) {
		simplePost('/api/ticket/use', {
			ticketId: tid
		}, function() {
			$(this).text('票已使用或已作废').attr('disabled', true);
		});
	}
} 

var loadOrder = function() {
	simplePost('/api/order/view', {
		orderId: orderId
	}, function(ret) {
		order = ret.order
		var route = ret.order.route;
		var dept = new Date(route.startTime);
		$('#src').text(route.src.name);
		$('#dest').text(route.dest.name);
		$('#schedule').text(formattedDateTime(dept));
		$('#dept').text(formattedTime(dept));
		$('#price').text(route.price/100)
		$('#personsPaid').text(route.personsPaid);
		$('#content-detail').text(route.notice);
		$('#totalprice').text(order.priceToPay / 100);
		$('#ordernum').text(order.orderNumber)
		for (var idx in order.passengers) {
			var psg = order.passengers[idx];
			var divPsg = $('<div>').addClass('entry');
			var icon = $('<span>').addClass('icon-addon icon-psg1');
			var name = $('<span>').addClass('entry-main').text(psg.name);
			var fold = $('<span>').addClass('fold-addon');
			divPsg.append(icon, name, fold);
			var detail = $('<div>').addClass('content hidden');
			var mobile = $('<div>').addClass('text-3').text('手机号：' + psg.phone);
			var idnum = $('<div>').addClass('text-3').text('身份证：' + psg.idnum);
			detail.append(mobile, idnum);
			var ticket = findTicket(psg.id);
			if (ticket) {
				var code = $('<div>').addClass('text-3').text('票号：' + ticket.code);
				detail.append(code);
				if (ticket.schedule) {
					var plateNum = $('<div>').addClass('text-3').text('车牌号：' + ticket.schedule.plateNumber);
					detail.append(plateNum);
					if (ticket.schedule.conductor) {
						var conductorName = $('<div>').addClass('text-3').text('负责人姓名：' + ticket.schedule.conductor.name);
						var conductorPhone = $('<div>').addClass('text-3').text('负责人电话：' + ticket.schedule.conductor.phone);
						detail.append(conductorName, conductorPhone);
					}
				}
				var divBoard = $('<div>');
				if (ticket.state === 'unused') {
					var btnBoard = $('<button>').addClass('btn orange btn-board').text('检票上车').data('tid', ticket.id).click(boardHandler);
				} else {
					var btnBoard = $('<button>').addClass('btn btn-board').attr('disabled', true).text('票已使用或已作废');
				}
				divBoard.append(btnBoard);
				detail.append(divBoard);
			}
			bindFold(divPsg, detail);
			$('#psg-list').append(divPsg, detail);
		}
		switch (order.state) {
			case 'unpay': case 'paying':
				$('#btn-pay').click(payHandler).show();
				$('#btn-cancel').click(cancelHandler).show();
				$('#tips').show();
				break;
			case 'paid':
				$('#btn-cancel').click(cancelHandler).show();
				break;
			case 'finished':
				$('#state').text('已完成').show();
				break;
			case 'cancelling':
				$('#state').text('正在取消').show();
				break;
			case 'cancelled':
				$('#state').text('已取消').show();;
		}
	});
};

var showPassenger = function() {
	pager.switchTo('page-psg', '查看乘客');
}

var showAgreement = function() {
	if (loaded.agreement) {
		pager.switchTo('page-agreement', '用车协议');
	} else {
		simpleGet('/wx/AGREEMENT.txt', function(data) {
			$('#agreement').text(data);
			pager.switchTo('page-agreement', '用车协议');
			loaded.agreement = true;
		});
	}
};

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
	pager.init('page-order');
	loadOrder();
	bindFold($('#fold-detail'), $('#content-detail'));
	$('#fold-agreement').click(showAgreement);
	$('#fold-notice').click(showToknow);
	$('#fold-psg').click(showPassenger);
});
