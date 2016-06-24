var AV = require('leanengine');
var userMethods = require('../user/user');
var orderMethods = require('../order/order');

var TransactionQuery = AV.Object.extend('TransactionQuery');

function packupTransactionQuery(transactionQuery) {
	var result = {};
	result.id = transactionQuery.id;
	result.user = userMethods.packup(transactionQuery.get('user'));
	result.type = transactionQuery.get('type');
	result.state = transactionQuery.get('state');
	result.order = orderMethods.packup(transactionQuery.get('order'));
	result.account = transactionQuery.get('account');
	result.channel = transactionQuery.get('channel');
	result.amount = transactionQuery.get('amount');
	result.currency = transactionQuery.get('currency');
	result.extra = transactionQuery.get('extra');
	return result;
}

function getTransactionQueryList() {
	var transactionQueryQuery = new AV.Query(TransactionQuery);

	transactionQueryQuery.equalTo('isDeleted', false);
	transactionQueryQuery.notEqualTo('state', 'finished');

	transactionQueryQuery.include('user');
	transactionQueryQuery.include('order');
	transactionQueryQuery.include('order.route');
	transactionQueryQuery.include('order.route.src');
	transactionQueryQuery.include('order.route.dest');

	return transactionQueryQuery.find();
}

exports.packupTransactionQuery = packupTransactionQuery;
exports.getTransactionQueryList = getTransactionQueryList;