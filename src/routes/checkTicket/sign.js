var router = require('express').Router();
var AV = require('leanengine');

var Schedule = AV.Object.extend('Schedule');

var limitSignInTime = 60 * 60 * 1000;

router.post('/signIn', function(req, res) {
	var scheduleQuery = new AV.Query(Schedule);
	var code = req.body.code;
	var password = req.body.password;

	scheduleQuery.include('route');
	scheduleQuery.get(req.body.scheduleId)
	.then(function(result) {
		if (result.get('isFinished') == true) {
			res.send({status: 'error', data: '不存在该班次'});
			return;
		}

		if (code == result.get('code') && password == result.get('password')) {
			req.session.check = true;

			setTimeout(function() {		//clean the session， for sureity
				req.session.check = false;
			}, limitSignInTime);

			res.send({status: 'success'});
		}
		else {
			res.send({status: 'error', data: '密码错误'});
		}
	}, function(err) {
		res.send({status: 'error', data: 'can\'t found'});
	});
});

router.post('/signOut', function(req, res) {
	req.session.check = false;
});

module.exports = router;