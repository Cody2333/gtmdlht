var AV = require('leanengine');
var router = require('express').Router();
var routeMethod = require('./route');
var commonRes = require('../common-response');

var UcRoute = AV.Object.extend('UnCheckedRoute');

/*申请路线
params	:src,dest
send	:err|success
*/
router.post('/create', function (req, res) {
	var user = req.AV.User;
	var src = req.body.src;
	var dest = req.body.dest;
	if (src == null || dest == null) {
		res.json({
			err: {
				code: 200,
				des: "起始地或目的地不能为空"
			}
		})
	}
	routeMethod.addUncheckRouteP(user, src, dest).then(function () {
		commonRes.simpleSuccess(res);
	}, function (err) {
		commonRes.unknownError(res, 2, err);
	});
});

/*查看申请的路线 
send	:{
			err,
			ret: uncheckedRoutes[]
		}
*/
router.post('/myRoutes', function (req, res) {
	var user = req.AV.User;
	var query = new AV.Query(UcRoute);
	query.equalTo('user', user);
	query.find().then(function (results) {
		res.json({
			err: {
				code: 0,
				des: ""
			},
			ret: {
				uncheckedRoutes: routeMethod.avUcRouteToFrontUcRoute(results)
			}
		});
	}, function (err) {
		commonRes.unknownError(res, 2, err);
	})
});

module.exports = router;
