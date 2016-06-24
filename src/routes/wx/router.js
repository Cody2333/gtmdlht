var router = require('express').Router();

var config = require('../../config')
var ensureWxLogin = require('./ensureWxLogin');
var ensurePhoneLogin = require('./ensurePhoneLogin');
var route = require('./route/router');
var my = require('./my/router');

router.get('/error', function(req, res) {
  var params = {
    code: '500',
    msg: '未知错误',
    detail: ''
  }
  if (req.get('Referrer') && req.get('Referrer').indexOf(config.wx.prefix) === 0) {
    params.code = req.query.code || params.code;
    params.msg = req.query.msg || params.msg;
    params.detail = req.query.detail || params.detail;
  }
  res.status(params.code).render('wx/error.ejs', params);
})
router.use('/', ensureWxLogin); // 以下路由均要求微信登录才能访问
router.get('/login', function(req, res) {
  res.render('wx/login.ejs', {
    title: '登录',
    css: ['jike-ui.css', 'login.css'],
    js: ['jike-ui.js', 'login.js']
  });
});
router.use('/', ensurePhoneLogin); // 以下路由均要求手机登录才能访问
router.use('/route', route);
router.use('/my', my);
router.use('/', function(req, res, next) {
  res.status(404).render('wx/error.ejs', {
    code: '404',
    msg: '您要访问的页面不见了耶'
  });
});

module.exports = router;
