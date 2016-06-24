
var apiParamCheck = function (req, res, next) {
	if (req.body.skip != null) {
		if (isNaN(req.body.skip)) {
			res.json({
				err: {
					code: 200,
					des: "参数类型不对"
				}
			});
			return;
		}
	}
	if (req.body.limit != null) {
		if (isNaN(req.body.limit)) {
			res.json({
				err: {
					code: 200,
					des: "参数类型不对"
				}
			});
			return;
		}
	}
	next();
}

module.exports = apiParamCheck;