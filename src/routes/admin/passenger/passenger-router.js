var router = require('express').Router();
var passengerMethods = require('./passenger');

router.post('/listByUserId', function(req, res) {
	var passengers = new Array();
	passengerMethods.getPassengerListByUserId(req.body.userId)
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			passengers.push(passengerMethods.packup(results[i]));
		}
		res.send({status: "success", data: passengers});
	}, function(err) {
		res.send({status: "error", data: err});
	});
});

module.exports = router;