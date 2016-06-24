var router = require('express').Router();
var transactionMethods = require('./transaction');
var refund = require('./refund');

router.post('/transactionQueryList', function(req, res) {
	var transactionQuerys = new Array();
	transactionMethods.getTransactionQueryList()
	.then(function(results) {
		for (var i = 0; i <results.length; i++) {
			transactionQuerys.push(transactionMethods.packupTransactionQuery(results[i]));
		}

		res.send({status: 'success', data: transactionQuerys});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/refund', function(req, res) {
	refund.refundOrder(req.body.id);
	res.send({status: 'success'});
})

module.exports = router;