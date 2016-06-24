angular.module('app', [])
.config(function($locationProvider) {
    $locationProvider.html5Mode(true);
 })
.controller('Main', ['$scope', '$http', '$location', function Main($scope, $http, $location) {
	var scheduleId = $location.search().id;

	$scope.isSignIn = false;
	$scope.showErr = false;
	$scope.errInfo = 'default';
	$scope.schedule = {};
	$scope.tickets = [];

	getTickets();

	function getTickets() {
		$http({url: '/checkTicket/ticket/list', method: 'POST', data: {scheduleId: scheduleId}})
		.success(function(res) {
			console.log(res);
			if (res.status == 'success') {
				$scope.isSignIn = true;
				for (var i = 0; i < res.data.length; i++) {
					res.data[i].state = res.data[i].state=='used' ? '已使用' : '未使用';
				}
				$scope.tickets = res.data;
			}
			else if (res.status == 'login') {
				$scope.isSignIn = false;
			}
			else {
			}
		});
	}

	$scope.use = function(index) {
		$http({url: '/checkTicket/ticket/use', method: 'POST', data: {id: $scope.tickets[index].id}})
		.success(function(res) {
			if (res.status == 'success') {
				$scope.tickets[index].state = '已使用';
			}
			else if (res.status == 'login') {
				$scope.isSignIn = false;
			}
		})
	}

	$scope.signIn = function() {
		$http({url: '/checkTicket/sign/signIn', method: 'POST', data: 
			{code: $scope.schedule.code, password: $scope.schedule.password, scheduleId: scheduleId}})
		.success(function(res) {
			// console.log(res);
			if (res.status == 'success') {
				$scope.isSignIn = true;
				getTickets();
			}
			else if (res.status == 'error') {
				$scope.showErr = true;
				$scope.errInfo = res.data;
			}
		});
	}

	$scope.hideErr = function() {
		$scope.showErr = false;
	}
}]);
