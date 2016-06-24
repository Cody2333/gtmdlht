var switchPage = function(oldPage, newPage, direction) {
	var oldTo, newFrom;
	if (direction == 'left') {
		oldTo = '-100%';
		newFrom = '100%';
	} else if (direction == 'right') {
		oldTo = '100%';
		newFrom = '-100%';
	}
	oldPage
		.css('left', '0')
		.animate({'left': oldTo}, 250);
	newPage
		.removeClass('hidden')
		.css('left', newFrom)
		.animate({'left': '0'}, 250);
}

var bindFold = function(foldEntry, content) {
	foldEntry.click(function() {
		if (content.is(':hidden')) {
			content.slideDown(80);
			foldEntry.children('.fold-addon').addClass('spread');
		} else {
			content.slideUp(80);
			foldEntry.children('.fold-addon').removeClass('spread');
		}
	});
}

var checkboxHandler = function() {
	$(this).hasClass('disabled') || $(this).toggleClass('checked');
	return false;
}

var pager = {
	init: function(current) {
		this.title = document.title;
		this.def = current;
		this.current = current;
		window.onpopstate = popStateHandler;
	},
	switchTo: function(next, title, url) {
		switchPage($('#' + this.current), $('#' + next), 'left');
		this.current = next;
		document.title = '即客巴士 - ' + title; 
		history.pushState({
			pid: this.current,
			title: document.title
		}, '即客巴士 - ' + title, url);
	}
}

var popStateHandler = function(e) {
	var last = e.state && e.state.pid || pager.def;
	var title = e.state && e.state.title || pager.title;
	if (pager.current != last) {
		switchPage($('#' + pager.current), $('#' + last), 'right');
		document.title = title;
		pager.current = last;
	}
}

var loader = {
	inited: false,
	show: function() {
		if (!this.inited) {
			var wrapper = $('<div>').attr('id', 'loading');
			$('body').append(wrapper);
			this.inited = true;
		} else {
			$('#loading').show();
		}
	},
	hide: function() {
		$('#loading').hide();
	}
}

var simplePost = function(url, params, success) {
	loader.show();
	$.post(url, params)
	.done(function(data) {
		if (data.err.code === 0) {
			if (data.ret) {
				success(data.ret);
			} else {
				success();
			}
		} else {
			alert(data.err.des);
		}
	})
	.fail(function() {
		alert('网络故障或未知错误');
	})
	.always(function() {
		loader.hide();
	})
}

var simpleGet = function(url, success) {
	loader.show();
	$.get(url)
	.done(function(data) {
		success(data);

	})
	.fail(function() {
		alert('网络故障或未知错误');
	})
	.always(function() {
		loader.hide();
	})
}

var formattedDate = function(d) {
	var year = d.getFullYear().toString();
	var month = (d.getMonth()+1).toString();
	var day = d.getDate().toString();
	if (month.length < 2) {
		month = '0' + month;
	}
	if (day.length < 2) {
		day = '0' + day;
	}
	return year + '-' + month + '-' + day;
};

var formattedTime = function(d) {
	var hour = d.getHours().toString();
	var minute = d.getMinutes().toString();
	var second = d.getSeconds().toString();
	if (hour.length < 2) {
		hour = '0' + hour;
	}
	if (minute.length < 2) {
		minute = '0' + minute;
	}
	return hour + ':' + minute;
};

var formattedDateTime = function(d) {
	return formattedDate(d) + ' ' + formattedTime(d);
};
