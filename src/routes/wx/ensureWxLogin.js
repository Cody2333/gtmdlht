var request = require('request');

var config = require('../../config');

var moment = require('moment');

var getOpenid = function(req, res, next) {
  var code = req.query.code;
  if (encodeURIComponent(code) != code) { // 有特殊字符，可能为恶意请求
    res.render('error.ejs', {
      msg: '微信登录失败'
    });
    return
  }
  // 通过code获取openid
  var urlGrantId = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + config.wx.appid +
    '&secret=' + config.wx.appsecret +
    '&code=' + encodeURIComponent(code) + '&grant_type=authorization_code';
  request.get(urlGrantId, function(err, resp, body) {
    if (!err && res.statusCode == 200) {
      var data = JSON.parse(body);
      req.session.wxOpenid = data.openid;
      req.session.wxLogin = true;
      req.session.time = moment().valueOf();
      next();
    } else {
      res.render('error.ejs', {
        msg: '微信登录失败'
      });
    }
  });
}

ensureWxLogin = function(req, res, next) {
  if (req.session.wxLogin === true) { // 已经登录微信
    next();
  } else if (req.query.state != undefined) { // 是微信回调
    getOpenid(req, res, next);
  } else { // 没有登录微信
    // 获取换openid的凭据code
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    // PUZZLE: 如果在urlGrantCode里设置了state，Android上会返回两次code
    var urlGrantCode = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.wx.appid +
      '&redirect_uri=' + encodeURIComponent(fullUrl) +
      '&response_type=code&scope=snsapi_base#wechat_redirect';
    res.redirect(urlGrantCode);
  }
}

module.exports = ensureWxLogin;
