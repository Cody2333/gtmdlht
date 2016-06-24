angular.module('app', [])
.factory('page', function() {
	return {pageName: 'ViewCarType'};
})
.controller('PageController', ['$scope', 'page', function PageController($scope, page) {
	$scope.page = page;
	$scope.switchPage = function (pageName) {
		$scope.page.pageName = pageName;
	}
}])
.controller('ViewCarType', ['$scope', '$http', 'page', function ViewCarType($scope, $http, page) {
	$scope.page = page;
	$scope.carTypes = [];

	$http({url: "/admin/car/list", method: "POST", data: {skip: 0, limit: 100}})
	.success(function(res) {
		if (res.status == "success")
			$scope.carTypes = res.data;
		else if (res.status == 'error') {
			alert("error: " + res.data);
		}
	});

	$scope.delete = function(index) {
		$http({url: "/admin/car/delete", method: "POST", data: {id: $scope.carTypes[index].id}})
		.success(function(res) {
			if (res.status == "success")
				$scope.carTypes.splice(index, 1);
			else if (res.status == 'error') {
				alert("error: " + res.data);
			}
		});
	}
}])
.controller('AddCarType', ['$scope', '$http', 'page', function AddCarType($scope, $http, page) {
	$scope.page = page;
	$scope.carType = {};

	$scope.submit = function() {
		if ($scope.carType.company == null || $scope.carType.type==null || $scope.carType.totalSeat==null) {
			alert("内容不完整");
			return;
		}
		$http({url: '/admin/car/add', method: 'POST', 
			data: {company: $scope.carType.company, type: $scope.carType.type, totalSeat: $scope.carType.totalSeat}})
		.success(function(res) {
			if (res.status == 'success') {
				alert('添加成功');
			}
			else if (res.status == 'error') {
				alert("error");
				console.log(res);
			}
		});
	}
}]);