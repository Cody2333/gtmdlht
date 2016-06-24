angular.module('app', ['ui.bootstrap', 'ui.bootstrap.datetimepicker'])
.factory('page', function() {
    return {pageName: 'ViewOrder', user: {}, userOrder: [], passengers: [], agent: {}};
})
.controller('PageController', ['$scope', 'page', function PageController($scope, page) {
    $scope.page = page;
    $scope.switchPage = function (pageName) {
        $scope.page.pageName = pageName;
    }
}])
.controller('ViewOrder', ['$scope', '$http', 'page', function ViewOrder($scope, $http, page) {
	$scope.page = page;
	$scope.iTime = {time0: false, time1: false};
	$scope.test = false;
	$scope.order = {};
	$scope.orders = [];
	$scope.limit = 20;
	$scope.pageIndex = 0;
	$scope.orderPages = [];

	getOrderCount();
	getOrders();

	$scope.checked = function() {
		getOrderCount();
		getOrders();
	}

	$scope.showTime = function(index) {
		$scope.iTime[index] = true;
	}

	$scope.export = function() {
		var startTime = getStartTime() == null ? 'null' : getStartTime();
		var endTime = getEndTime() == null ? 'null' : getStartTime();
		window.open('/admin/order/down/' + startTime + '/' + endTime);
	}

	$scope.switchOrderPage = function(index) {
		$scope.pageIndex = index;
		getOrders();
	}

	function getOrders() {
		$http({url: '/admin/order/list', method: 'POST',
			data: {skip: $scope.pageIndex * $scope.limit, limit: $scope.limit, startTime: getStartTime(), endTime: getEndTime()}})
		.success(function(res) {
			if (res.status == 'success') {
				for (var i = 0; i < res.data.length; i++) {
					res.data[i].price = res.data[i].price / 100;
					res.data[i].priceToPay = res.data[i].priceToPay / 100;
				}
				$scope.orders = res.data;
			}
			else if (res.status == 'error') {
				alert('error: ' + res.data);
				console.log(res.data);
			}
		});
	}

	function getOrderCount() {
		$scope.pageIndex = 0;
		$scope.orderPages = [];

		$http({url: '/admin/order/count', method: 'POST', 
			data: {skip: $scope.pageIndex * $scope.limit, limit: $scope.limit, startTime: getStartTime(), endTime: getEndTime()}})
		.success(function(res) {
			if (res.status == 'success') {
				var pageNum = Math.ceil(res.data / $scope.limit);
				for (var i = 0; i < pageNum; i++) {
					$scope.orderPages.push(i + 1);
				}
			}
			else if (res.status == 'error') {
				alert('error in order count');
				console.log(res.data);
			}
		})
	}
	
	function getStartTime() {
		var startTime = null;
		if ($scope.order.startTime != null) {
			startTime = $scope.order.startTime.getTime();
		}
		return startTime;
	}

	function getEndTime() {
		var endTime = null;
		if ($scope.order.endTime != null) {
			endTime = $scope.order.endTime.getTime() + 24 * 60 * 60 * 1000;
		}
		return endTime;
	}
}])
.controller('PayOrder', ['$scope', '$http', 'page', function PayOrder($scope, $http, page) {
	$scope.page = page;
	$scope.order = {};
	$scope.step = 0;
	$scope.err = 0;
	$scope.errorInfo = 'default';

	$scope.search = function() {
		$http({url: '/admin/order/getByOrderNumber', method: 'POST', data: {orderNumber: $scope.order.orderNumber}})
		.success(function(res) {
			if (res.status == 'success') {
				res.data.price = res.data.price / 100;
				res.data.priceToPay = res.data.priceToPay / 100;

				$scope.order = res.data;
				$scope.step = 1;
			}
			else if (res.status == 'error') {
				$scope.errorInfo = res.data;
				$scope.err = 1;
				console.log(res.data);
			}
		});
	}

	$scope.payOrder = function() {
		if ($scope.order.otherId == null) {
			return;
		}
		$http({url: '/admin/order/pay', method: 'POST', data: {id: $scope.order.id, priceToPay: $scope.order.priceToPay * 100, otherId: $scope.order.otherId}})
		.success(function(res) {
			if (res.status == 'success') {
				alert('付款成功');
			}
			else if (res.status == 'error') {
				alert('error:' + res.data);
				console.log(res.data);
			}
		});
	}

	$scope.orderNumberChange = function() {
		$scope.step = 0;
		$scope.err = 0;
	}
}])
.controller('TransactionQuery', ['$scope', '$http', 'page', function TransactionQuery($scope, $http, page) {
	$scope.page = page;
	$scope.transactionQuerys = [];
	var checkTime = true;

	getPageInfos();

	function getPageInfos() {
		$http({url: '/admin/transaction/transactionQueryList', method: 'POST'})
		.success(function(res) {
			if (res.status == 'success') {
				$scope.transactionQuerys = res.data;
			}
			else if (res.status == 'error') {
				alert('error in get transaction query list');
				console.log(res.data);
			}
		});
	}

	$scope.check = function(index) {
		var transactionQueryId = $scope.transactionQuerys[index].id;
		if (checkTime == true) {
			checkTime = false;
			setTimeout(function() {
				checkTime = true;
			}, 2000);
		}
		else {
			checkTime = true;
			$http({url: '/admin/transaction/refund', method: 'POST', data: {id: transactionQueryId}})
			.success(function(res) {
				if (res.status == 'success') {
					$scope.transactionQuerys[index].state = 'pending';
					alert('退款进行中，请稍后手动刷新页面');
				}
				else {
					alert('error in refund');
					console.log(res.data);
				}
			});
		}
	}


}]);