var moment = require('moment');
var AV = require('leanengine');

/*api 的访问时间间隔检查
两次访问间隔不能小于0.1s
send	: err(json)
 */
var apiTimeCheck = function (req, res, next) {
	if (req.session.time != null && req.session.queryTimes != null) {
		var now = moment();
		var last = moment(req.session.time);
		if (last.add(100, 'ms').isAfter(now) && req.session.queryTimes%2 == 0) {
			res.json({
				err: {
					code: 100,
					des: "访问api过于频繁"
				}
			});
		} else {
			req.session.time = now.valueOf();
			req.session.queryTimes = req.session.queryTimes%2 + 1;
			next();
		}
	} else {
		req.session.time = moment().valueOf();
		req.session.queryTimes = 1;
		next();
	}
}

module.exports = apiTimeCheck;