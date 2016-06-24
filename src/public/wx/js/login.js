$(document).ready(function(){

	$('#btn-getcode').click(function(){
		var phone = $('#phone').val();
		if (!/^1\d{10}$/.test(phone)) {
			alert('手机号格式不正确');
			return;
		}
		simplePost('/api/user/prelogin', {
			phone: phone
		}, function() {
			alert('验证码发送成功')
		});
	});

	$('#btn-login').click(function(){
		var phone = $('#phone').val();
		var code = $('#code').val();
		if (!/^1\d{10}$/.test(phone)) {
			alert('手机号格式不正确');
			return;
		}
		if (!/^\d{6}$/.test(code)) {
			alert('验证码不正确');
			return;
		}
		simplePost('/api/user/login', {
			phone: phone,
			code: code
		}, function() {
			alert('登录成功');
			var redirect = false;
			var params = window.location.search.substr(1).split('&');
			for (var idx in params) {
				var param = params[idx].split('=');
				if (param.length == 2 && param[0] == 'redirect') {
					redirect = decodeURIComponent(param[1]);
					break;
				}
			}
			var parser = $('<a>').attr('href', redirect)[0];
			if (redirect && parser.host == window.location.host) {
				window.location.replace(redirect);
			}
		});
	});
});
