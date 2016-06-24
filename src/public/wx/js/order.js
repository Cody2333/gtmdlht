var noMore = false;
var numOnce = 10;
var last,
  lastElem;

var gotoOrder0 = function() {
  window.location.href = '/wx/my/order/' + $(this).data('oid');
};

var gotoOrder = function() {
  window.location.href = '/wx/my/order/' + $(this).parent().data('order').id;
};

var loadMore = function() {
  if (noMore) {
    return;
  }
  if (lastElem) {
    lastElem.unbind('appear');
  }
  simplePost('/api/order/list', {
    last: last,
    number: numOnce
  }, function(ret) {
    if (ret.orders.length < numOnce) {
      noMore = true;
    }
    if (ret.orders.length !== 0) {
      $('#noorder').remove();
    }
    for (var idx in ret.orders) {
      var order = ret.orders[idx];
      var entryBody = $('<div>').addClass('basic-info');
      var l0 = $('<div>').addClass('l0');
      var ilb0 = $('<div>').addClass('ilb');
      var iconSrc = $('<span>').addClass('icon icon-src');
      var src = $('<span>').addClass('src').text(order.route.srcFullName);
      var iconTo = $('<span>').addClass('icon icon-to');
      ilb0.append(iconSrc, src, iconTo);
      var ilb1 = $('<div>').addClass('ilb');
      var iconDest = $('<span>').addClass('icon icon-dest');
      var dest = $('<span>').addClass('dest').text(order.route.destFullName);
      ilb1.append(iconDest, dest);
      l0.append(ilb0, ilb1);
      var l1 = $('<div>').addClass('l1');
      var joined = $('<span>').addClass('joined').text(order.route.personsPaid + '人已加入');
      l1.append(joined);
      var l2 = $('<div>').addClass('l2');
      var iconDept = $('<span>').addClass('icon icon-departure');
      var dept = $('<span>').addClass('departure').text(formattedDateTime(new Date(order.route.startTime)) + '出发');
      var price = $('<span>').addClass('price').text('￥' + order.priceToPay / 100);
      l2.append(iconDept, dept, price);
      entryBody.append(l0, l1, l2).click(gotoOrder0).data('oid', order.id);
      var entryAction = $('<div>').addClass('content').data('order', order);
      var action;
      switch (order.state) {
        case 'unpay':
        case 'paying':
          action = $('<button>').addClass('btn red btn-action').text('取消订单').click(gotoOrder);
          entryAction.append(action);
          action = $('<button>').addClass('btn orange btn-action').text('去付款').click(gotoOrder);
          break;
        case 'paid':
          action = $('<button>').addClass('btn red btn-action').text('取消订单').click(gotoOrder);
          break;
        case 'finished':
          action = $('<span>').addClass('state').text('已完成');
          break;
        case 'cancelling':
          action = $('<span>').addClass('state').text('正在取消');
          break;
        case 'cancelled':
          action = $('<span>').addClass('state').text('已取消');
      }
      entryAction.append(action);
      lastElem = entryAction;
      $('#order-list').append(entryBody, entryAction);
    }
    if (lastElem) {
      lastElem.appear(loadMore);
    }

  });
}

$(document).ready(function() {
  loadMore();
});
