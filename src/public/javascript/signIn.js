angular.module('app', []).controller('adminSignIn', ['$scope', '$http', function adminSignIn($scope, $http) {
	$scope.adminName = null;
	$scope.adminPassword = null;
	$scope.signIn = function(){
		$http({method: "POST", url: "/admin/sign/signIn", data: {name: $scope.adminName, password: $scope.adminPassword}})
		.success(function(res) {
			if (res == "success") {
				window.location.href = "/admin/consoleRoute.html";
			}
			else {
				alert("密码错误");
			}
		});
	}
}]);