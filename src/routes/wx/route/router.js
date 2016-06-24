var router = require('express').Router();

router.get('/submit', function(req, res) {
	res.render('wx/route_submit.ejs', {
		title: '发布路线',
		css: ['jike-ui.css', 'route_submit.css'],
		js: ['jike-ui.js', 'route_submit.js']
	})
});

router.get('/select', function(req, res) {
	res.render('wx/route_select.ejs', {
		title: '选择路线',
		css: ['jike-ui.css', 'coupon.css', 'route_select.css'],
		js: ['jike-ui.js', 'route_select.js']
	});
})

router.get('/:routeid', function (req, res) {
	res.render('wx/route_view.ejs', {
		title: '查看路线',
		routeid: req.params.routeid,
		css: ['jike-ui.css', 'coupon.css', 'route_view.css'],
		js: ['jike-ui.js', 'route_view.js']
	});
});

module.exports = router;
