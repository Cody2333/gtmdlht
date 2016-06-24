var request = require('request');
var AV = require('leanengine');

var config = require('../../config');

var ensurePhoneLogin = function (req, res, next) {
	if (req.session.phoneLogin === true) { // 已经绑定了手机号
		next();
	} else {
		var openId = req.session.wxOpenid;
		var query = new AV.Query(AV.User);
		query.equalTo('wxOpenId', openId);
		query.first().then(function(result) {
			if (result) {
				AV.User.logInWithMobilePhone(result.get("mobilePhoneNumber"), "111111")
				.then(function(user){
					req.session.phoneLogin = true;
					next();
				});
			} else {
				var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
				res.redirect(config.wx.prefix + '/login?redirect=' + encodeURIComponent(fullUrl));
			}
		});
	}
}

module.exports = ensurePhoneLogin;
