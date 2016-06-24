var pid;
var thisPsg;

var checkData = function () {
	if (!/.{2,10}/.test($('#name').val())) {
		alert('姓名不正确');
		return false;
	} else if (!/\d{11}/.test($('#phone').val())) {
		alert('手机号不正确');
		return false;
	} else if (!/\d{17}[\dxX]/.test($('#idnum').val())) {
		alert('身份证号不正确');
		return false;
	}
	return true;
};

var psgEditHandler = function () {
	$('#btn-create2').hide();
	$('#btn-edit').show();
	$('#btn-delete').show();
	thisPsg = $(this);
	pid = thisPsg.data('id');
	$('#name').val(thisPsg.data('name'));
	$('#phone').val(thisPsg.data('phone'));
	$('#idnum').val(thisPsg.data('idnum'));
	pager.switchTo('page-edit', '编辑乘客');
};

var psgCreateHandler = function () {
	$('#btn-create2').show();
	$('#btn-edit').hide();
	$('#btn-delete').hide();
	$('#name').val('');
	$('#phone').val('');
	$('#idnum').val('');
	pager.switchTo('page-edit', '添加乘客');
};

var psgEdit2Handler = function() {
	if (!checkData()) {
		return;
	}
	simplePost('/api/passenger/update', {
		passengers: JSON.stringify([{
			id: pid,
			name: $('#name').val(),
			phone: $('#phone').val(),
			idnum: $('#idnum').val()
		}])
	}, function() {
		thisPsg.find('.psg-name').text($('#name').val());
		thisPsg.find('.psg-phone').text('手机号：' + $('#phone').val());
		thisPsg.find('.psg-idnum').text('身份证：' + $('#idnum').val());
		alert('修改成功');
	});
};

var psgDeleteHandler = function() {
	simplePost('/api/passenger/delete', {
		objectId: pid
	}, function() {
		thisPsg.remove();
		alert('删除成功');
		history.back();
	});
};

var psgCreate2Handler = function() {
	if (!checkData()) {
		return;
	}
	simplePost('/api/passenger/add', {
		name: $('#name').val(),
		phone: $('#phone').val(),
		idnum: $('#idnum').val()
	}, function(ret) {
		alert('添加成功');
		pid = ret.passengerId;
		appendPassenger(pid, $('#name').val(), $('#phone').val(), $('#idnum').val());
		$('#btn-create2').hide();
		$('#btn-edit').show();
		$('#btn-delete').show();
	});
};

$(document).ready(function() {

	loadPassenger();
	loadUserId();

	pager.init('page-passengers');
	$('#btn-create').click(psgCreateHandler);
	$('#btn-edit').click(psgEdit2Handler);
	$('#btn-delete').click(psgDeleteHandler);
	$('#btn-create2').click(psgCreate2Handler);

});

var appendPassenger = function(id, name, phone, idnum) {
	var divPsg = $('<div>').addClass('psg');
	var psgInfo = $('<div>').addClass('psg-info');
	var psgTitle = $('<div>').addClass('psg-title');
	var icon = $('<span>').addClass('psg-icon');
	var psgName = $('<span>').addClass('psg-name').text(name);
	var divider = $('<div>').addClass('divider');
	var psgBody = $('<div>').addClass('psg-body');
	var pPhone = $('<p>').addClass('text-3 psg-phone').text('手机号：' + phone);
	var pIdnum = $('<p>').addClass('text-3 psg-idnum').text('身份证：' + idnum);
	var psgEdit = $('<div>').addClass('psg-edit');
	psgTitle.append(icon).append(psgName);
	psgBody.append(pPhone, pIdnum);
	psgInfo.append(psgTitle, divider, psgBody);
	divPsg.append(psgInfo, psgEdit);
	divPsg.data({
		id: id,
		name: name,
		phone: phone,
		idnum: idnum
	});
	divPsg.click(psgEditHandler);
	$('#group-passengers').append(divPsg);
};

var loadPassenger = function() {
	simplePost('/api/passenger/list', {}, function(data) {
		for (var idx in data.passengers) {
			appendPassenger(data.passengers[idx].id, data.passengers[idx].name, data.passengers[idx].phone, data.passengers[idx].idnum);
		}
	});
};

var loadUserId = function() {
	simplePost('/api/user/userId', {}, function(data) {
		var pUserid = $('<p>').text('您的用户ID是：' + data.userId);
		$('#userid').append(pUserid);
	});
}