var AV = require('leanengine');
var userMethods = require('../user/user');
var locationMethods = require('../location/location');
var User = AV.User;
var AgentInfo = AV.Object.extend('AgentInfo');
var AgentCommissionRule = AV.Object.extend('AgentCommissionRule');
var AgentCommissionRuleMap = AV.Object.extend('AgentCommissionRuleMap');
var DiscountRuleMap = AV.Object.extend('DiscountRuleMap');
var Location = AV.Object.extend('Location');

function packup(agent) {
	var result = {};
	result.id = agent.id;
	result.name = agent.get("username");
	result.phone = agent.get("mobilePhoneNumber");
	result.idnum = agent.get("IDnumber");
	result.agentInfo = packupAgentInfo(agent.get('agentInfo'));
	result.balance = agent.get('balance');
	result.code = agent.get('code');

	return result;
}

function packupAgentInfo(agentInfo) {
	var result = {};
	result.id = agentInfo.id;
	result.src = locationMethods.packup(agentInfo.get('agentSource'));
	result.liveConsumer = agentInfo.get('liveConsumer');
	result.preliveConsumer = agentInfo.get('preliveConsumer');
	result.agentCommissionRule = packupAgentCommissionRule(agentInfo.get('agentCommissionRule'));
	return result;
}

function packupAgentCommissionRule(agentCommissionRule) {
	var result = {};
	result.id = agentCommissionRule.id;
	result.description = agentCommissionRule.get('description');
	result.commissionFunction = agentCommissionRule.get('commissionFunction');
	return result;
}

function packupAgentCommissionRuleMap(agentCommissionRuleMap) {
	var result = {};
	result.id = agentCommissionRuleMap.id;
	result.src = locationMethods.packup(agentCommissionRuleMap.get('source'));
	result.name = agentCommissionRuleMap.get('name');
	result.agentCommissionRule = packupAgentCommissionRule(agentCommissionRuleMap.get('agentCommissionRule'));
	return result;
}

function getAgentList(skip, limit) {
	var userQuery = new AV.Query(User);

	if (skip != null) {
		userQuery.skip(skip);
	}
	if (limit != null) {
		userQuery.limit(limit);
	}
	userQuery.equalTo('isDeleted', false);
	userQuery.equalTo('isAgent', true);

	userQuery.include('agentInfo');
	userQuery.include('agentInfo.agentSource');
	userQuery.include('agentInfo.agentCommissionRule')

	return userQuery.find();
}

function addAgent(userId, srcId) {
	var agentCommissionRuleMapQuery = new AV.Query(AgentCommissionRuleMap);
	var discountRuleMapQuery = new AV.Query(DiscountRuleMap);
	var location = new Location();
	location.id = srcId;
	var agentCommissionRule = new AgentCommissionRule();
	var agentInfo = new AgentInfo();
	var user;

	return userMethods.getUserById(userId)
	.then(function(result) {
		user = result;
		if (user.get('isAgent') == true) {
			return AV.Promise.error('该用户已经是代理');
		}

		discountRuleMapQuery.equalTo('source', location);
		discountRuleMapQuery.equalTo('type', 'agent');
		discountRuleMapQuery.equalTo('isDeleted', false);

		return discountRuleMapQuery.find();
	}, function(result) {
		return AV.Promise.error('该用户不存在');
	})
	.then(function(results) {
		if (results.length == 0) {
			return AV.Promise.error("没有找到对应的代理优惠码优惠规则");
		}
		if (results.length > 1) {
			return AV.Promise.error('有不止一个对应的代理优惠码优惠规则');
		}

		agentCommissionRuleMapQuery.equalTo('source', location);
		agentCommissionRuleMapQuery.equalTo('isDeleted', false);
		return agentCommissionRuleMapQuery.find();
	})
	.then(function(results) {
		if (results.length == 0) {
			return AV.Promise.error("没有找到对应的提成规则");
		}
		if (results.length > 1) {
			return AV.Promise.error('有不止一个对应的提成规则');
		}
		agentCommissionRule.id = results[0].get('agentCommissionRule').id;

		agentInfo.set('agent', user);
		agentInfo.set('agentSource', location);
		agentInfo.set('agentCommissionRule', agentCommissionRule);
		agentInfo.set('preliveConsumer', 0);
		agentInfo.set('liveConsumer', 0);
		agentInfo.set('isDeleted', false);
		return agentInfo.save();
	})
	.then(function(result) {
		var newAgentInfo = new AgentInfo();
		newAgentInfo.id = result.id;

		user.set('isAgent', true);
		user.set('agentInfo', newAgentInfo);
		user.set('balance', 0);
		return user.save();
	});
}

function addAgentCommissionRule(description, commissionFunction) {
	var agentCommissionRule = new AgentCommissionRule();
	if (description == null) {
		return AV.Promise.error('未填写描述');
	}
	if (commissionFunction == null) {
		return AV.Promise.error('函数为空');
	}
	agentCommissionRule.set('description', description);
	agentCommissionRule.set('commissionFunction', commissionFunction);
	agentCommissionRule.set('isDeleted', false);
	return agentCommissionRule.save();
}

function addAgentCommissionRuleMap(srcId, agentCommissionRuleId) {
	var agentCommissionRuleMapQuery = new AV.Query(AgentCommissionRuleMap);
	var agentCommissionRuleMap = new AgentCommissionRuleMap();
	var agentCommissionRule = new AgentCommissionRule();
	agentCommissionRule.id = agentCommissionRuleId;
	var location = new Location();
	location.id = srcId;

	agentCommissionRuleMapQuery.equalTo('source', location);
	agentCommissionRuleMapQuery.equalTo('isDeleted', false);

	return agentCommissionRuleMapQuery.find()
	.then(function(results) {
		if (results.length != 0) {
			return AV.Promise.error('该地点所对应的提成规则已存在');
		}
		agentCommissionRuleMap.set('source', location);
		agentCommissionRuleMap.set('agentCommissionRule', agentCommissionRule);
		agentCommissionRuleMap.set('isDeleted', false);
		return agentCommissionRuleMap.save();
	});
}

function getAgentCommissionRuleList(skip, limit) {
	var agentCommissionRuleQuery = new AV.Query(AgentCommissionRule);
	if (skip != null) {
		agentCommissionRuleQuery.skip(skip);
	}
	if (limit != null) {
		agentCommissionRuleQuery.limit(limit);
	}
	agentCommissionRuleQuery.equalTo('isDeleted', false);
	return agentCommissionRuleQuery.find();
}

function getAgentCommissionRuleMapList(skip, limit) {
	var agentCommissionRuleMapQuery = new AV.Query(AgentCommissionRuleMap);
	if (skip != null) {
		agentCommissionRuleMapQuery.skip(skip);
	}
	if (limit != null) {
		agentCommissionRuleMapQuery.limit(skip);
	}
	agentCommissionRuleMapQuery.equalTo('isDeleted', false);
	agentCommissionRuleMapQuery.include('source');
	agentCommissionRuleMapQuery.include('agentCommissionRule');
	return agentCommissionRuleMapQuery.find();
}

function updateAgentCommissionRuleMap(agentCommissionRuleMapId, agentCommissionRuleId) {
	var agentCommissionRuleMap = new AgentCommissionRuleMap();
	var agentCommissionRule = new AgentCommissionRule()
	agentCommissionRuleMap.id = agentCommissionRuleMapId;
	agentCommissionRule.id = agentCommissionRuleId;
	agentCommissionRuleMap.set('agentCommissionRule', agentCommissionRule);
	agentCommissionRuleMap.fetchWhenSave(true);
	return agentCommissionRuleMap.save()
	.then(function() {
		var agentCommissionRuleMapQuery = new AV.Query(AgentCommissionRuleMap);
		return agentCommissionRuleMapQuery.get(agentCommissionRuleMapId);
	})
	.then(function(result) {
		var src = new Location();
		src.id = result.get('source').id;
		var agentInfoQuery = new AV.Query('AgentInfo');
		agentInfoQuery.equalTo('agentSource', src);
		agentInfoQuery.equalTo('isDeleted', false);
		return agentInfoQuery.find();
	})
	.then(function(results) {
		for (var i = 0; i < results.length; i++) {
			results[i].set('agentCommissionRule', agentCommissionRule);
			results[i].save();
		}
	});
}

function deleteAgentCommissionRule(agentCommissionRuleId) {
	var agentInfoQuery = new AV.Query(AgentInfo);
	var agentCommissionRule = new AgentCommissionRule();
	agentCommissionRule.id = agentCommissionRuleId;
	agentInfoQuery.equalTo('agentCommissionRule', agentCommissionRule);
	agentInfoQuery.equalTo('isDeleted', false);
	return agentInfoQuery.find()
	.then(function(results) {
		if (results.length != 0) {
			return AV.Promise.error('该规则已绑定代理，请先取消绑定');
		}
		agentCommissionRule.set('isDeleted', true);
		return agentCommissionRule.save();
	});
}

exports.packup = packup;
exports.packupAgentCommissionRule = packupAgentCommissionRule;
exports.packupAgentCommissionRuleMap = packupAgentCommissionRuleMap;
exports.getAgentList = getAgentList;
exports.getAgentCommissionRuleList = getAgentCommissionRuleList;
exports.getAgentCommissionRuleMapList = getAgentCommissionRuleMapList;
exports.addAgent = addAgent;
exports.addAgentCommissionRule = addAgentCommissionRule;
exports.addAgentCommissionRuleMap = addAgentCommissionRuleMap;
exports.updateAgentCommissionRuleMap = updateAgentCommissionRuleMap;
exports.deleteAgentCommissionRule = deleteAgentCommissionRule;