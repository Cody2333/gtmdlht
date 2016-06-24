var refundMoneyDeadline = 86400000; //以前定的是能全额退款的最后时间，现在是退80%。距离发车前一天
var addBusDeadline = 86400000;		//确定巴士数量的最后时间，距离发车前一天
var refundDeadline = 3600000;		//能退款的最后时间，距离发车前一小时
var buyDeadline = 3600000;			//能购票的最后时间，距离发车前一小时

exports.refundMoneyDeadline = refundMoneyDeadline;
exports.addBusDeadline = addBusDeadline;
exports.refundDeadline = refundDeadline;
exports.buyDeadline = buyDeadline;