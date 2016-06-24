var router = require('express').Router();

router.get('/ticket', function(req, res) {
	res.render('wx/ticket.ejs', {
		title: '检票上车',
		css: ['jike-ui.css', 'ticket.css'],
		js: ['jike-ui.js', 'ticket.js']
	});
});

router.get('/passenger', function(req, res) {
	res.render('wx/passenger.ejs', {
		title: '我的乘客',
		css: ['jike-ui.css', 'passenger.css'],
		js: ['jike-ui.js', 'passenger.js']
	});
});

router.get('/order', function(req, res) {
	res.render('wx/order.ejs', {
		title: '我的订单',
		css: ['jike-ui.css', 'order.css'],
		js: ['jquery.appear.js', 'jike-ui.js', 'order.js']
	});
})

router.get('/order/:orderid/paid', function(req, res) {
	res.render('wx/order_created.ejs', {
		title: '成功付款',
		css: ['jike-ui.css', 'order_created.css'],
		orderid: req.params.orderid
	})
});

router.get('/order/:orderid', function(req, res) {
	res.render('wx/order_view.ejs', {
		title: '查看订单',
		css: ['jike-ui.css', 'order_view.css'],
		js: ['jike-ui.js', 'pingpp.js', 'order_view.js'],
		orderid: req.params.orderid
	})
})

router.get('/coupon', function(req, res) {
	res.render('wx/coupon.ejs', {
		title: '我的优惠券',
		css: ['jike-ui.css', 'coupon.css'],
		js: ['jike-ui.js', 'my_coupon.js']
	})
})

module.exports = router;
