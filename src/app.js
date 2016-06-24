'use strict';
var AV = require('leanengine');
var domain = require('domain');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var bkCloud = require('./backend/cloud');
var config = require('./config');
var app = express();

// 强制使用 https
// app.use(AV.Cloud.HttpsRedirect());

// 加载云代码方法
app.use(bkCloud);


// app.use(AV.Cloud.HttpsRedirect());
app.use(AV.Cloud.CookieSession({ secret: 'jikeabcdefg', maxAge: 3600000, fetchUser: true }));


app.use(morgan('combined'))

// 设置 view 引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//user session
app.use(cookieParser());
app.use(session({
    secret: 'it is secret',
    cookie: {maxAge: 1800000, secure: false },  //设置maxAge是30min，即30min后session和相应的cookie失效过期
    resave: false,
    saveUninitialized: true
}));

app.use(function(req, res, next) {
  app.locals.config = config;
  next();
});

app.get('/', function(req, res) {
  // res.render('index', { currentTime: new Date() });
  res.sendFile("/index.html");
});

app.use('/admin', require('./routes/admin/router')); // 后台相关路由
app.use('/checkTicket', require('./routes/checkTicket/router'));
app.use('/wx', require('./routes/wx/router'));

app.use('/api',require('./backend/router'));

// 如果任何路由都没匹配到，则认为 404
app.use(function(req, res, next) {
  res.status(404).end();
});

// error handlers

// 如果是开发环境，则将异常堆栈输出到页面，方便开发调试
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) { // jshint ignore:line
    console.log('this is an error');
    console.log(err.message);
    res.render('error.ejs', {
      msg: err.message,
      detail: JSON.stringify(err)
    });
  });
}

// 如果是非开发环境，则页面只输出简单的错误信息
app.use(function(err, req, res, next) { // jshint ignore:line
  res.status(err.status || 500);
  // res.render('error', {
  //   message: err.message,
  //   error: {}
  // });
});

module.exports = app;
