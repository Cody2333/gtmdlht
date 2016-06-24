var router = require('express').Router();

var scheduleMethods = require('./schedule');
var ticketMethods = require('../ticket/ticket');

router.post('/listByRouteId', function(req, res) {
	var schedules = new Array();
	scheduleMethods.getScheduleListByRouteId(req.body.id)
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			schedules.push(scheduleMethods.packup(results[i]));
		}

		res.send({status: "success", data: schedules});
	}, function(err) {
		res.send({status: "error", data: err});
	});
});

router.post('/add', function(req, res) {
	scheduleMethods.addScheduleByRouteId(req.body.id)
	.then(function(result) {
		res.send({status: 'success', data: scheduleMethods.packup(result)});
	}, function(err) {
		res.send({status: "error", data: err});
	});
});

router.post('/update', function(req, res) {
	// console.log(req.body.schedule);
	scheduleMethods.updateSchedule(req.body.schedule)
	.then(function() {
		res.send({status: 'success'});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/delete', function(req, res) {
	scheduleMethods.deleteSchedule(req.body.id)
	.then(function() {
		ticketMethods.removeScheduleByScheduleId(req.body.id);
		res.send({status: 'success'});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
})

module.exports = router;