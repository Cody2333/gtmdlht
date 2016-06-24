var router = require('express').Router();

var carMethods = require('./car');

router.post('/list', function(req, res) {
	var cars = new Array();
	carMethods.getCarList(req.body.skip, req.body.limit)
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			cars.push(carMethods.packup(results[i]));
		}
		res.send({status: "success", data: cars});
	}, function(err) {
		res.send({status: "error", data: err});
	});
});

router.post('/delete', function(req, res) {
	carMethods.deleteCar(req.body.id)
	.then(function(result) {
		res.send({status: 'success'});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/add', function(req, res) {
	carMethods.addCar(req.body.company, req.body.type, req.body.totalSeat)
	.then(function(result) {
		res.send({status: 'success'});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});



module.exports = router;