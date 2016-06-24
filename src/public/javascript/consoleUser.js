angular.module('app', [])
.factory('page', function() {
    return {pageName: 'ViewUser', user: {}, userOrder: [], passengers: [], agent: {}};
})
.controller('PageController', ['$scope', 'page', function PageController($scope, page) {
    $scope.page = page;
    $scope.switchPage = function (pageName) {
        $scope.page.pageName = pageName;
    }
}])
.controller('ViewUser', ['$scope', '$http', 'page', function ViewUser($scope, $http, page) {
    $scope.userArray;
    $scope.page = page;
    var userNumPerPage = 15;
    $scope.userPages = new Array();
    $scope.pageIndex = 0;

    function getUserList(skip, limit) {
        $http({url: "/admin/user/list", method: "POST", data: {skip: skip, limit: limit}})
        .success(function (res) {
            if (res.status == "success") {
                $scope.userArray = res.data;
            }
            else if (res.status == 'error') {
                alert(res.data);
            }
        });
    }

    $http({url: '/admin/user/count', method: 'POST'})
    .success(function(res) {
        if (res.status == 'success') {
            var userPageNum = Math.ceil(res.data/userNumPerPage);
            for (var i = 0; i < userPageNum; i++) {
                $scope.userPages.push(i+1);
            }
            getUserList(0, userNumPerPage);
        }
    });

    $scope.switchUserPage = function(index) {
        getUserList(index * userNumPerPage, userNumPerPage);
        $scope.pageIndex = index;
    }

    $scope.viewOrder = function(index) {
        $scope.page.pageName = "ViewUserOrder";
        $scope.page.user = $scope.userArray[index];
        $http({url: "/admin/order/listByUserId", method: "POST", data: {userId: $scope.page.user.id}})
        .success(function(res) {
            if (res.status == "success") {
                for (var i = 0; i < res.data.length; i++) {
                    res.data[i].price = res.data[i].price / 100;
                    res.data[i].priceToPay = res.data[i].priceToPay / 100;
                }
                $scope.page.userOrder = res.data;
            }
            else if (res.status == 'error') {
                alert(res.data);
            }
        });
    }

    $scope.viewPassenger = function(index) {
        $scope.page.pageName = "ViewPassenger";
        $scope.page.user = $scope.userArray[index];
        $http({url: "/admin/passenger/listByUserId", method: "POST", data: {userId: $scope.page.user.id}})
        .success(function(res) {
            if (res.status == "success") {
                console.log(res.data);
                $scope.page.passengers = res.data;
            }
            else if (res.status == 'error') {
                alert(res.data);
            }
        });
    }
}])
.controller('ViewUserOrder', ['$scope', '$http', 'page', function ViewUserOrder($scope, $http, page) {
    $scope.page = page;

    $scope.viewPassenger = function(index) {
        $http({url: "/admin/passenger/getListByUserId", method: "POST", data: {userId: $scope.page.user.id}})
        .success(function(res) {
            if (res.status == "success")
                $scope.page.passengers = res.data;
            else if (res.status == 'error') {
                alert(res.data);
            }
        });
    }
}])
.controller('ViewPassenger', ['$scope', '$http', 'page', function ViewPassenger($scope, $http, page) {
    $scope.page = page;
}]);