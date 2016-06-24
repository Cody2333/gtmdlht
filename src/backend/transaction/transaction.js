var AV = require('leanengine');
var Transaction = AV.Object.extend('Transaction');
var Order = AV.Object.extend('Order');

/*将后台数据库的交易信息转化为前端使用的格式
params	:transactions(array)[DBdoc中的格式]
return	:transactions(array)[Apidoc中的格式]
*/
function avTransactionToFrontTransaction(transactions) {
	if (transactions == null) {
		return null;
	}
	var result = [];
	for (var i = 0; i < transactions.length; i++) {
		var userId ,orderId;
		if(transactions[i].get('order') != null){
			orderId = transactions[i].get('order').id;
		}
		if(transactions[i].get('user') !=null ){
			userId = transactions[i].get('user');
		}
		result.push({
			id: transactions[i].id,
			chargeId: transactions[i].get('chargeId'),
			orderId: orderId,
			userId: userId,
			channel: transactions[i].get('channel'),
			amount: transactions[i].get('amount'),
			currency: transactions[i].get('currency'),
			type: transactions[i].get('type'),
			paid: transactions[i].get('paid'),
			extra: transactions[i].get('extra')
		});
	}
	return result;
}


/*记录订单支付的交易信息
params	:order(object)[DBdoc中的格式], charge(object)[ping++返回的charge对象], isFinished(boolean)
在数据库里创建一个新的transaction
*/
function logOrderPayTransactionP(order, charge, isFinished) {
	var query = new AV.Query(Transaction);
	query.equalTo('order', order);
	query.equalTo('chargeId', charge.id);
	return query.find().then(function (results) {
		if (results.length == 0) {
			var transaction = new Transaction();
			transaction.set('chargeId', charge.id);
			transaction.set('order', order);
			transaction.set('user', order.get('user'));
			transaction.set('channel', charge.channel);
			transaction.set('amount', charge.amount);
			transaction.set('currency', charge.currency);
			transaction.set('type', 'pay');
			transaction.set('paid', charge.paid);
			transaction.set('extra',JSON.stringify(charge.extra));
			transaction.set('isFinished', isFinished);
			transaction.set('isDeleted', false);
			return transaction.save();
		} else {
			results[0].set('paid', charge.paid);
			results[0].set('isFinished', isFinished);
			results[0].set('extra',JSON.stringify(charge.extra));
			return results[0].save();
		}
	});
}

/*记录订单退款的交易信息,将用户的退款请求设置为完成状态
params	:trQuery(object)[DBdoc中的格式]"交易请求", refundObj(object)[ping++返回的refund对象]
在数据库里创建一个新的transaction
*/
function logOrderRefundTransactionP(trQuery, refundObj) {
	var transaction = new Transaction();
	transaction.set('chargeId', refundObj.charge);
	transaction.set('refundId', refundObj.id);
	transaction.set('order', trQuery.get('order'));
	transaction.set('transactionQuery', trQuery);
	transaction.set('amount', refundObj.amount);
	transaction.set('type', 'refund');
	transaction.set('paid', true);
	transaction.set('isDeleted', false);
	return transaction.save();

}

exports.avTransactionToFrontTransaction = avTransactionToFrontTransaction;
exports.logOrderPayTransactionP = logOrderPayTransactionP;
exports.logOrderRefundTransactionP = logOrderRefundTransactionP;