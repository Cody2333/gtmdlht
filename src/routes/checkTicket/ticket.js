var router = require('express').Router();
var AV = require('leanengine');

var seePhoneTime = 10 * 60 * 1000;

var Ticket = AV.Object.extend('Ticket');
var Schedule = AV.Object.extend('Schedule');

router.post('/list', function(req, res) {
	var ticketQuery = new AV.Query(Ticket);
	var scheduleQuery = new AV.Query(Schedule);
	var schedule = new Schedule();
	var tickets = new Array();

	var showPhone = false;

	schedule.id = req.body.scheduleId;
	ticketQuery.equalTo('schedule', schedule);
	ticketQuery.equalTo('isDeleted', false);
	ticketQuery.include('passenger');
	ticketQuery.ascending('code');

	scheduleQuery.include('route');
	scheduleQuery.get(req.body.scheduleId)
	.then(function(result) {
		var startTime = result.get('route').get('startTime').getTime();
		var now = (new Date()).getTime();
		if (startTime - now < seePhoneTime) {
			showPhone = true;
		}
		return ticketQuery.find();
	})
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			tickets[i] = {};
			tickets[i].code = results[i].get('code');
			tickets[i].state = results[i].get('state');
			tickets[i].id = results[i].id;
			if (showPhone && results[i].get('state' == 'unused')) {
				tickets[i].phone = results[i].get('passenger').get('passengerPhone');
			}
		}
		res.send({status: 'success', data: tickets});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/use', function(req, res) {
	var ticket = new Ticket();
	ticket.id = req.body.id;
	ticket.set('state', 'used');
	ticket.save()
	.then(function() {
		res.send({status: 'success'});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

module.exports = router;