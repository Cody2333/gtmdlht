#!/usr/bin/env node

var path     = require('path');
var fs       = require('fs');
var request  = require('request');
var url      = require('url');

var common   = require('./common');

// 处理配置文件中的URL，加上前缀
var urlProcess = function (URL) {
	return url.resolve(common.config.wx.prefix + '/', URL);
}

// 读取菜单配置
wxMenu = JSON.parse(fs.readFileSync(path.join(__dirname, 'wxMenu.json')));

for (btnTop in wxMenu.button) {
	if (wxMenu.button[btnTop].url) {
		wxMenu.button[btnTop].url = urlProcess(wxMenu.button[btnTop].url)
	} else {
		for (btnSecond in wxMenu.button[btnTop].sub_button) {
			wxMenu.button[btnTop].sub_button[btnSecond].url = urlProcess(wxMenu.button[btnTop].sub_button[btnSecond].url)
		}
	}
}

common.grantToken(function (token) {
	console.log(token);
	request.post(
		'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=' + token,
		{form: JSON.stringify(wxMenu)},
		function (err, res, body) {
			console.log(body);
		}
	);
});
