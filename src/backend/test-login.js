var AV = require('leanengine');
var commonRes = require('./common-response');
//测试用的自动登录
function testLogin(req, res, next) {
	if (req.AV.user == null) {
		AV.User.logInWithMobilePhone('13162568870', commonRes.commonPass).then(function () {
			res.send('正在登录');
		}, function (err) {
			commonRes.unknownError(res, 2, err);
		});
	} else {
		next();
	}
}

module.exports = testLogin;