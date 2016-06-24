var router = require('express').Router();
var AV = require('leanengine');
var userMethods = require('./user.js');

var User = AV.User;

router.post('/list', function(req, res) {
	var users = new Array();

	userMethods.getUserList(req.body.skip, req.body.limit)
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			users.push(userMethods.packup(results[i]));
		}
		res.send({status: "success", data: users});
	}, function(err) {
		res.send({status: "error", data: err});
	});
});

router.post('/count', function(req, res) {
	userMethods.getUserCount()
	.then(function(result) {
		res.send({status: 'success', data: result});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/getByPhone', function(req, res) {
	userMethods.getUserByPhone(req.body.phone)
	.then(function(result) {
		if (result.length == 0)
			res.send({status: 'success', data: null});
		else
			res.send({status: 'success', data: userMethods.packup(result[0])});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/tellerList', function(req, res) {
	var tellers = new Array();
	userMethods.getTellerList(req.body.skip, req.body.limit)
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			tellers.push(userMethods.packup(results[i]));
		}
		res.send({status: 'success', data: tellers});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

module.exports = router;