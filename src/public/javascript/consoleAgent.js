angular.module('app', ['ui.bootstrap'])
.factory('page', function() {
    return {pageName: 'ViewAgent', user: {}, userOrder: [], passengers: [], agent: {}};
})
.controller('PageController', ['$scope', 'page', function PageController($scope, page) {
    $scope.page = page;
    $scope.switchPage = function (pageName) {
        $scope.page.pageName = pageName;
    }
}])
.service('tool', function() {
	this.switchToRealFunction = function(mockFunction) {
		var realFunc = 'function(price, preliveConsumer) {\
			var x = price / 100;\
			var y = preliveConsumer;\
			var z;\n';
		realFunc += mockFunction;
		realFunc += '\nreturn z * 100;}';
		return realFunc;
	}
	this.switchToMockFunction =function(realFunction) {
		var firstIndex = realFunction.indexOf('var z;');
		var secondIndex = realFunction.indexOf('\nreturn z * 100;}');
		return realFunction.substring(firstIndex + 7, secondIndex);
	}
})
.service('getBasicInfo', function($http, tool) {
	this.getLocations = function(array) {
		array.length = 0;
		$http({url: '/admin/location/list', method: 'POST'})
		.success(function(res) {
			if (res.status == 'success') {
				for (var i = 0; i < res.data.length; i++) {
					array.push(res.data[i]);
				}
			}
			else if (res.status == 'error') {
				alert('error in showLocation');
				console.log(res.data);
			}
		});
	}

	this.getCommissionRules = function(array) {
		array.length = 0;
		$http({url: '/admin/agent/commissionRuleList', method: 'POST', data: {skip: 0, limit: 15}})
			.success(function(res) {
				if (res.status == 'success') {
					for (var i = 0; i < res.data.length; i++) {
						res.data[i].mockCommissionFunction = tool.switchToMockFunction(res.data[i].commissionFunction);
						array.push(res.data[i]);
					}
				}
				else if (res.status == 'error') {
					alert('error in get agent commission list');
					console.log(res.data);
				}
			});
	}

	this.getDiscountRules = function(array) {
		array.length = 0;
		$http({url: '/admin/coupon/discountRuleList', method: 'POST', data: {skip: 0, limit: 20}})
		.success(function(res) {
			if (res.status == 'success') {
				for (var i = 0; i < res.data.length; i++) {
					res.data[i].mockFunction = tool.switchToMockFunction(res.data[i].discountFunction);
					array.push(res.data[i]);
				}
			}
			else if (res.status == 'error') {
				alert('error in getDiscountCodes');
				console.log(res.data);
			}
		});
	}
})
.controller('ViewAgent', ['$scope', '$http', 'page', function ViewAgent($scope, $http, page) {
	$scope.page = page;
	$scope.agents = [];
	$http({url: '/admin/agent/list', method: 'POST', data: {skip: 0, limit: 15}})
	.success(function(res) {
		if(res.status == 'success') {
			$scope.agents = res.data;
		}
		else if (res.status == 'error') {
			alert('error');
			console.log(res.data);
		}
	})
}])
.controller('AddAgent', ['$scope', '$http', 'page', 'getBasicInfo', function AddAgent($scope, $http, page, getBasicInfo) {
	$scope.page = page;
	$scope.agent = {};
	$scope.agentInfo = {};
	$scope.phone;
	$scope.step = 0;
	$scope.rightBarType = 0;
	$scope.rightBarItems = [];
	$scope.err = 0;
	$scope.errorInfo = "";

	$scope.search = function() {
		$http({url: '/admin/user/getByPhone', method: 'POST', data: {phone: $scope.agent.phone}})
		.success(function(res) {
			if (res.status == 'success') {
				if (res.data != null) {
					$scope.agent = res.data;
					$scope.agent.src = {};
					$scope.step = 1;
				}
				else {
					$scope.err = 1;
					$scope.errorInfo = "没有找到该手机号的用户";
				}
			}
			else if (res.status == 'error') {
				alert('error');
				console.log(res.data);
			}
		});
	}

	$scope.phoneChange = function() {
		$scope.step = 0;
		$scope.err = 0;
	}

	$scope.showLocation = function() {
		$scope.rightBarType = 1;
		$scope.rightBarHead = "代理所在地";
		getBasicInfo.getLocations($scope.rightBarItems);
	}

	$scope.hideRightBar = function() {
		$scope.rightBarType = 0;
	}

	$scope.setToAgent = function() {
		if ($scope.agent.id == null || $scope.agent.src == null || $scope.agent.src.id == null) {
			return;
		}
		$http({url: '/admin/agent/add', method: 'POST', data: {userId: $scope.agent.id, srcId: $scope.agent.src.id}})
		.success(function(res) {
			if (res.status == 'success') {
				alert('添加成功');
			}
			else if (res.status == 'error') {
				alert('error: ' + res.data);
			}
		});
	}

	$scope.checked = function() {
		if($scope.rightBarType == 1) {
			$scope.agent.src = JSON.parse($scope.agentInfo.src);
		}
		$scope.rightBarType = 0;
	}
}])
.controller('AgentCommission', ['$scope', '$http', 'page', 'tool' ,'getBasicInfo', function AgentCommission($scope, $http, page, tool, getBasicInfo) {
	$scope.page = page;
	$scope.agentCommissionRules = [];
	$scope.pageType = 0;
	$scope.agentCommission = {};

	getPageInfos();

	$scope.switchPage = function(type) {
		$scope.pageType = type;
		getPageInfos();
	}

	$scope.getTestResult = function() {
		var order = {};
		var agent = {agentInfo: {}};
		order.price = $scope.agentCommission.inputPrice * 100;
		agent.agentInfo.preliveConsumer = $scope.agentCommission.inputPreliveConsumer;
		order.get = function(param) {
			return order[param];
		}
		agent.get = function(param) {
			return agent[param];
		}
		agent.agentInfo.get = function(param) {
			return agent.agentInfo[param];
		}
		var func = eval('(' + tool.switchToRealFunction($scope.agentCommission.commissionFunction) + ')');
		$scope.agentCommission.result = func(order.price, agent.agentInfo.preliveConsumer) / 100;
	}

	$scope.add = function() {
		if ($scope.agentCommission.description == null || $scope.agentCommission.commissionFunction == null) {
			alert('请填写完整在提交');
			return;
		}
		$http({url: '/admin/agent/addAgentCommissionRule', method: 'POST', 
			data: {description: $scope.agentCommission.description, commissionFunction: tool.switchToRealFunction($scope.agentCommission.commissionFunction)}})
		.success(function(res) {
			if (res.status == 'success') {
				alert("提交成功");
			}
			else if (res.status == 'error') {
				alert("error" + res.data);
				console.log(res.data);
			}
		});
	}

	$scope.delete = function(index) {
		$http({url: '/admin/agent/deleteAgentCommissionRule', method: 'POST', data: {id: $scope.agentCommissionRules[index].id}})
		.success(function(res) {
			if (res.status == 'success') {
				$scope.agentCommissionRules.splice(index, 1);
			}
			else if (res.status == 'error') {
				alert('error: ' + res.data);
				console.log(res.data);
			}
		});
	}

	function getPageInfos() {
		if ($scope.pageType == 0) {
			getBasicInfo.getCommissionRules($scope.agentCommissionRules);
		}
		if ($scope.pageType == 1) {
			
		}
	}
}])
.controller('AgentCommissionMap', ['$scope', '$http', 'page', 'getBasicInfo', function AgentCommissionMap($scope, $http, page, getBasicInfo) {
	$scope.page = page;
	$scope.agentCommissionRuleMaps = [];
	$scope.pageType = 0;
	$scope.agentCommissionRuleMap = {};
	$scope.agentCommissionRuleMapInfo = {};
	$scope.rightBarType = 0;
	$scope.rightBarHead = "default";
	$scope.rightBarItems = [];
	$scope.indexChecked = 0;

	getPageInfos();

	$scope.switchPage = function(type) {
		$scope.pageType = type;
		getPageInfos();
	}

	$scope.showLocation = function(type, index) {
		$scope.rightBarType = type;
		$scope.rightBarHead = "地点列表";
		if (index != null) {
			$scope.indexChecked = index;
		}
		getBasicInfo.getLocations($scope.rightBarItems);
	}

	$scope.showCommissionRule = function(type, index) {
		$scope.rightBarType = type;
		$scope.rightBarHead = "提成规则列表";
		if (index != null) {
			$scope.indexChecked = index;
		}
		getBasicInfo.getCommissionRules($scope.rightBarItems);
	}

	$scope.saveCommissionRuleMap = function(index) {
		$http({url: '/admin/agent/updateAgentCommissionRuleMap', method: 'POST', 
			data: {agentCommissionRuleMapId: $scope.agentCommissionRuleMaps[index].id, agentCommissionRuleId: $scope.agentCommissionRuleMaps[index].agentCommissionRule.id}})
		.success(function(res) {
			if (res.status == 'success') {
				alert('保存完成');
			}
			else if (res.status == 'error') {
				alert('error in saveCommissionRuleMap');
				console.log(res.data);
			}
		})
	}

	$scope.add = function() {
		if ($scope.agentCommissionRuleMap.agentCommissionRule == null || $scope.agentCommissionRuleMap.src == null)
			return;
		$http({url: '/admin/agent/addAgentCommissionRuleMap', method: 'POST',
			data: {agentCommissionRuleId: $scope.agentCommissionRuleMap.agentCommissionRule.id,
				srcId: $scope.agentCommissionRuleMap.src.id}})
		.success(function(res) {
			if (res.status == 'success') {
				alert('添加成功');
			}
			else if (res.status == 'error') {
				alert('error: ' + res.data);
				console.log(res.data);
			}
		});
	}

	$scope.checked = function() {
		if ($scope.rightBarType == 1) {
			$scope.agentCommissionRuleMap.src = JSON.parse($scope.agentCommissionRuleMapInfo.src);
		}
		if ($scope.rightBarType == 2) {
			$scope.agentCommissionRuleMap.agentCommissionRule = JSON.parse($scope.agentCommissionRuleMapInfo.agentCommissionRule);
		}
		if ($scope.rightBarType == 3) {
			$scope.agentCommissionRuleMaps[$scope.indexChecked].agentCommissionRule = JSON.parse($scope.agentCommissionRuleMapInfo.agentCommissionRule);
		}
		$scope.rightBarType = 0;
	}

	$scope.hideRightBar = function() {
		$scope.rightBarType = 0;
	}


	function getPageInfos() {
		if ($scope.pageType == 0) {
			$http({url: '/admin/agent/commissionRuleMapList', method: 'POST'})
			.success(function(res) {
				if (res.status == 'success') {
					$scope.agentCommissionRuleMaps = res.data;
				}
				else if (res.status == 'error') {
					alert('error');
					console.log(res.data);
				}
			});
		}
		if ($scope.pageType == 1) {

		}
	}

}])
.controller('DiscountRuleMap', ['$scope', '$http', 'page', 'getBasicInfo', function DiscountRuleMap($scope, $http, page, getBasicInfo) {
	$scope.page = page;
	$scope.pageType = 0;
	$scope.discountRuleMaps = [];
	$scope.discountRuleMap = {};
	$scope.rightBarType = 0;
	$scope.rightBarItems = [];
	$scope.rightBarHead = '';
	$scope.discountRuleMapInfo = {};
	$scope.indexChecked = 0;

	getPageInfos();

	$scope.switchPage = function(type) {
		$scope.pageType = type;
		getPageInfos();
	}

	$scope.add = function() {
		if ($scope.discountRuleMap.src == null || $scope.discountRuleMap.discountRule == null || $scope.discountRuleMap.show == null) {
			return;
		}
		var validTime = null;
		var validPrice = null;
		var validSrcId = null;
		if ($scope.discountRuleMap.validTime != null) {
			validTime = $scope.discountRuleMap.validTime * 24 * 60 * 60 * 1000;
		}
		if ($scope.discountRuleMap.validPrice != null) {
			validPrice = $scope.discountRuleMap.validPrice * 100;
		}
		if ($scope.discountRuleMap.validSrc != null) {
			validSrcId = $scope.discountRuleMap.validSrc.id;
		}
		$http({url: '/admin/coupon/addDiscountRuleMap', method: 'POST',
			data: {srcId: $scope.discountRuleMap.src.id, show: $scope.discountRuleMap.show, discountRuleId: $scope.discountRuleMap.discountRule.id,
				validSrcId: validSrcId, validPrice: validPrice, validTime: validTime}})
		.success(function(res) {
			if(res.status == 'success') {
				alert('添加成功');
			}
			else if (res.status == 'error') {
				alert('error: ' + res.data);
				console.log(res.data);
			}
		});
	}

	$scope.saveDiscountRuleMap = function(index) {
		var validTime = null;
		var validPrice = null;
		var validSrcId = null;
		if ($scope.discountRuleMaps[index].validTime != null) {
			validTime = $scope.discountRuleMaps[index].validTime * 24 * 60 * 60 * 1000;
		}
		if ($scope.discountRuleMaps[index].validPrice != null) {
			validPrice = $scope.discountRuleMaps[index].validPrice * 100;
		}
		if ($scope.discountRuleMaps[index].validSrc != null) {
			validSrcId = $scope.discountRuleMaps[index].validSrc.id;
		}
		$http({url: '/admin/coupon/updateDiscountRuleMap', method: 'POST',
			data: {discountRuleMapId: $scope.discountRuleMaps[index].id, show: $scope.discountRuleMaps[index].show, discountRuleId: $scope.discountRuleMaps[index].discountRule.id,
				validSrcId: validSrcId, validPrice: validPrice, validTime: validTime}})
		.success(function(res) {
			if (res.status == 'success') {
				alert('保存成功');
			}
			else if (res.status == 'error') {
				alert('error in saveDiscountRuleMap');
				console.log(res.data);
			}
		});
	}

	$scope.showLocation = function(type, index) {
		$scope.rightBarType = type;
		$scope.rightBarHead = "地点列表";
		if (index != null) {
			$scope.indexChecked = index;
		}
		getBasicInfo.getLocations($scope.rightBarItems);
	}

	$scope.showDiscountRule = function(type, index) {
		$scope.rightBarType = type;
		$scope.rightBarHead = "优惠券规则列表";
		if (index != null) {
			$scope.indexChecked = index;
		}
		getBasicInfo.getDiscountRules($scope.rightBarItems);
	}

	$scope.checked = function() {
		if ($scope.rightBarType == 1) {
			$scope.discountRuleMap.src = JSON.parse($scope.discountRuleMapInfo.src);
		}
		if ($scope.rightBarType == 2) {
			$scope.discountRuleMap.discountRule = JSON.parse($scope.discountRuleMapInfo.discountRule);
		}
		if ($scope.rightBarType == 3) {
			$scope.discountRuleMap.validSrc = JSON.parse($scope.discountRuleMapInfo.src);
		}
		if ($scope.rightBarType == 4) {
			$scope.discountRuleMaps[$scope.indexChecked].discountRule = JSON.parse($scope.discountRuleMapInfo.discountRule);
		}
		if ($scope.rightBarType == 5) {
			$scope.discountRuleMaps[$scope.indexChecked].validSrc = JSON.parse($scope.discountRuleMapInfo.src);
		}
		$scope.rightBarType = 0;
	}

	$scope.hideRightBar = function() {
		$scope.rightBarType = 0;
	}

	function getPageInfos() {
		if ($scope.pageType == 0) {
			$http({url: '/admin/coupon/discountRuleMapList', method: 'POST', data: {skip: 0, data: 15}})
			.success(function(res) {
				if (res.status == 'success') {
					// console.log(res.data);
					for (var i = 0; i < res.data.length; i++) {
						res.data[i].validTime = res.data[i].validTime / 24 / 60 / 60 / 1000;
						res.data[i].validPrice = res.data[i].validPrice / 100;
					}
					$scope.discountRuleMaps = res.data;
				}
				else if (res.status == 'error') {
					alert('error in getPageInfos()');
					console.log(res.data);
				}
			});
		}
	}

}]);