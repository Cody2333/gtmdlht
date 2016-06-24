var router = require('express').Router();

var locationMethods = require('./location');

router.post('/provinceList', function(req, res) {
	var provinces = new Array();
	locationMethods.getProvinceList()
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			provinces.push(locationMethods.packupArea(results[i]));
		}
		res.send({status: "success", data: provinces});
	}, function(err) {
		res.send({status: "error", data: err });
	});
});

router.post('/cityListByProvinceId', function(req, res) {
	var cities = new Array();
	locationMethods.getCityListByProvinceId(req.body.provinceId)
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			cities.push(locationMethods.packupArea(results[i]));
		}
		res.send({status: "success", data: cities});
	}, function(err) {
		res.send({status: "error", data: err});
	});
});

router.post('/list', function(req, res) {
	var locations = new Array();
	locationMethods.getLocationList()
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			locations.push(locationMethods.packup(results[i]));
		}
		res.send({status: "success", data: locations});
	}, function(err) {
		res.send({status: "error", data: err});
	})
});

router.post('/add', function(req, res) {
	locationMethods.addLocation(req.body.province, req.body.city, req.body.name, req.body.cityId, req.body.lat, req.body.lng)
	.then(function(result) {
		res.send({status: "success"});
	}, function(err) {
		res.send({status: "error", data: err});
	});
});

router.post('/delete', function(req, res) {
	locationMethods.deleteLocationByLocationId(req.body.id)
	.then(function(result) {
		res.send({status: "success"});
	}, function(err) {
		res.send({status: "error", data: err});
	})
});

module.exports = router;