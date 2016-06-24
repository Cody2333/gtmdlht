var router = require('express').Router();
var agentMethods = require('./agent');

router.post('/list', function(req, res) {
	var agents = new Array();
	agentMethods.getAgentList(req.body.skip, req.body.limit)
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			agents.push(agentMethods.packup(results[i]));
		}
		res.send({status: 'success', data: agents});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/add', function(req, res) {
	agentMethods.addAgent(req.body.userId, req.body.srcId)
	.then(function() {
		res.send({status: 'success'});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/addAgentCommissionRule', function(req, res) {
	agentMethods.addAgentCommissionRule(req.body.description, req.body.commissionFunction)
	.then(function() {
		res.send({status: 'success'});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/addAgentCommissionRuleMap', function(req, res) {
	agentMethods.addAgentCommissionRuleMap(req.body.srcId, req.body.agentCommissionRuleId)
	.then(function() {
		res.send({status: 'success'});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/commissionRuleList', function(req, res) {
	var agentCommissionRules = new Array();
	agentMethods.getAgentCommissionRuleList(req.body.skip, req.body.limit)
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			agentCommissionRules.push(agentMethods.packupAgentCommissionRule(results[i]));
		}
		res.send({status: 'success', data: agentCommissionRules});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/commissionRuleMapList', function(req, res) {
	var agentCommissionRuleMaps = new Array();
	agentMethods.getAgentCommissionRuleMapList(req.body.skip, req.body.limit)
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			agentCommissionRuleMaps.push(agentMethods.packupAgentCommissionRuleMap(results[i]));
		}
		res.send({status: 'success', data: agentCommissionRuleMaps});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
});

router.post('/updateAgentCommissionRuleMap', function(req, res) {
	agentMethods.updateAgentCommissionRuleMap(req.body.agentCommissionRuleMapId, req.body.agentCommissionRuleId)
	.then(function(result) {
		res.send({status: 'success'});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
})

router.post('/deleteAgentCommissionRule', function(req, res) {
	agentMethods.deleteAgentCommissionRule(req.body.id)
	.then(function() {
		res.send({status: 'success'});
	}, function(err) {
		res.send({status: 'error', data: err});
	});
})

module.exports = router;