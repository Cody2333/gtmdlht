"use strict";

function loadTickets() {
	simplePost('/api/ticket/listByUser', {}, function(ret) {
		if (ret.tickets.length !== 0) {
			$('#noticket').remove();
		}
		for (var i in ret.tickets) {
			var route = ret.tickets[i].route;
			var entryBody = $('<div>').addClass('basic-info');
			var l0 = $('<div>').addClass('l0');
			var ilb0 = $('<div>').addClass('ilb');
			var iconSrc = $('<span>').addClass('icon icon-src');
			var src = $('<span>').addClass('src').text(route.src);
			var iconTo = $('<span>').addClass('icon icon-to');
			ilb0.append(iconSrc, src, iconTo);
			var ilb1 = $('<div>').addClass('ilb');
			var iconDest = $('<span>').addClass('icon icon-dest');
			var dest = $('<span>').addClass('dest').text(route.dest);
			ilb1.append(iconDest, dest);
			l0.append(ilb0, ilb1);
			var l1 = $('<div>').addClass('l1');
			var iconDept = $('<span>').addClass('icon icon-departure');
			var dept = $('<span>').addClass('departure').text(formattedDateTime(new Date(route.departure)) + '出发');
			l1.append(iconDept, dept);
			entryBody.append(l0, l1);
			$('#ticket-list').append(entryBody);
			var tickets = $('<div>').addClass('panel');
			for (var j in ret.tickets[i].tickets) {
				var ticket = ret.tickets[i].tickets[j];
				var entry = $('<div>').addClass('entry');
				var iconPsg = $('<span>').addClass('icon-addon icon-psg');
				var psg = $('<span>').addClass('entry-main').text(ticket.name);
				var check = $('<div>').addClass('checkbox');
				if (ticket.state === 'unused') {
					check.addClass('checked').data('tid', ticket.id).click(checkboxHandler)
				} else {
					check.addClass('disabled');
				}
				var fold = $('<span>').addClass('fold-addon');
				entry.append(check, iconPsg, psg, check, fold);
				var detail = $('<div>').addClass('content hidden');
				var code = $('<div>').addClass('text-3').text('票号：' + ticket.code);
				detail.append(code);
				bindFold(entry, detail);
				$('#ticket-list').append(entry, detail);
			}
			$('#ticket-list').append($('<hr>'));
		}
	});
}

function useTicket() {
	var tids = [];
	$('.checkbox.checked:not(.disabled)').each(function (idx, elem) {
		tids.push($(elem).data('tid'));
	});
	simplePost('/api/ticket/use', {
		ticketId: tids
	}, function () {
		$('.checkbox.checked').addClass('disabled');
		alert('检票成功，欢迎上车');
	});
}

$(document).ready(function(){
	$('#btn-use').click(useTicket);
	loadTickets();
});
