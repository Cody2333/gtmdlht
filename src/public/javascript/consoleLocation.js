angular.module('app', [])
.factory('page', function() {
	return {pageName: 'ViewLocation'};
})
.controller('PageController', ['$scope', 'page', function PageController($scope, page) {
	$scope.page = page;
	$scope.switchPage = function (pageName) {
		$scope.page.pageName = pageName;
	}
}])
.controller('ViewLocation', ['$scope', '$http', 'page', function ViewLocation($scope, $http, page) {
	$scope.page = page;
	$scope.locations = [];
	$http({url: "/admin/location/list", method: "POST"})
	.success(function(res) {
		if (res.status == "success")
			$scope.locations = res.data;
		else if (res.status == 'error') {
			alert("error: " + res.data);
        }
	});
	$scope.delete = function(index) {
		$http({url: "/admin/location/delete", method: "POST", data: {id: $scope.locations[index].id}})
		.success(function(res) {
			if (res.status == "success")
				$scope.locations.splice(index, 1);
			else if (res.status == 'error') {
				alert("error: " + res.data);
            }
		});
	}
}])
.controller('AddLocation', ['$scope', '$http', 'page', function AddLocation($scope, $http, page) {
	$scope.page = page;
    $scope.set = 0;
    $scope.province = {name: '--省', id: 0};
    $scope.city = {name: '--市', id: 0};
    $scope.location = {name: ""};
    $scope.itemArray = [];

    $scope.showProvince = function() {
        $http({url: "/admin/location/provinceList", method: "POST"})
        .success(function(res) {
            if (res.status == "success") {
                $scope.itemArray = res.data;
                $scope.set = 0;
            }
            else if (res.status == 'error') {
                alert(res.data);
            }
        });
    }
    $scope.showCity = function() {
        if ($scope.province.id == 0)
            return;
        $http({url: "/admin/location/cityListByProvinceId", method: "POST", data: {provinceId: $scope.province.id}})
        .success(function(res) {
            if (res.status == "success") {
                $scope.itemArray = res.data;
                $scope.set = 1;
            }
            else if (res.status == 'error') {
                alert(res.data);
            }
        });
    }
    $scope.submit = function() {
        if ($scope.city == null || $scope.city.id == 0 || $scope.location.name == null || $scope.location.name == '') {
            alert('输入不完整');
            return;
        }
        $http({url: "/admin/location/add", method: "POST", 
            data: {province: $scope.province.name, city: $scope.city.name, 
                name: $scope.location.name, cityId: $scope.city.id, lat: $scope.location.lat, lng: $scope.location.lng}})
        .success(function(res) {
            alert("提交成功");
        });
    }
    $scope.itemClick = function(dom) {
        if ($scope.set == 0) {
            $scope.province = dom.item;
            $scope.city = {name: '--市', id: 0};
            $scope.showCity();
        }
        else if ($scope.set == 1) {
            $scope.city = dom.item;
            $scope.itemArray = [];
        }
    }
}]);