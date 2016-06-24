angular.module('app', ['ui.bootstrap', 'ui.bootstrap.datetimepicker'])
.config(function($locationProvider) {
    $locationProvider.html5Mode(true);
 })
.factory('page', function($location) {
    return {pageName: 'ViewRoute', route: {}, host: $location.host(), port: $location.port()};
})
.service('tool', function() {
    var self = this;
    this.deepCopy = function(src) {
        var result = {};
        for (var key in src) {
            result[key] = typeof src[key]==='object'? self.deepCopy(src[key]): src[key];
        }
        return result;
    }
    this.getTimeString = function(datetime) {
        var year = datetime.getFullYear();
        var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
        var date = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
        var hour = datetime.getHours()< 10 ? "0" + datetime.getHours() : datetime.getHours();
        var minute = datetime.getMinutes()< 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
        var second = datetime.getSeconds()< 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();
        return year + "-" + month + "-" + date+" "+hour+":"+minute+":"+second;
    }
})
.service('route', function($http, page) {
    this.getRouteDetail = function(route){
        // get ticket by route id
        $http({url: '/admin/ticket/listByRouteId', method: 'POST', data: {id: route.id, skip: 0, limit: 1000}})
        .success(function(res) {
            if (res.status == 'success') {
                route.tickets = res.data;
            }
            else if (res.status == 'error') {
                alert("error in getRouteDetail ");
                console.log(res.data);
            }
        });
        // get schedule by route id
        $http({url: '/admin/schedule/listByRouteId', method: 'POST', data: {id: route.id}})
        .success(function(res) {
            if(res.status == 'success') {
                route.schedules = res.data;
                route.doneTicket = 0;
                for (var i = 0; i < route.schedules.length; i++) {
                    route.doneTicket += route.schedules[i].takenSeat;
                    route.schedules[i].link = page.host + ':' + page.port + '/checkTicket/check.html?id=' + route.schedules[i].id;
                }
                route.unDoneTicket = route.personsPaid - route.doneTicket;
            }
            else if (res.status == 'error') {
                alert("error: " + res.data);
            }
        });
    }
})
.controller('PageController', ['$scope', 'page', function PageController($scope, page) {
    $scope.page = page;
    $scope.switchPage = function (pageName) {
        $scope.page.pageName = pageName;
    }
}])
.controller('ViewRoute', ['$scope', '$http', 'page', 'tool', 'route', function ViewRoute($scope, $http, page, tool, route) {
    $scope.routes = [];
    $scope.page = page;
    $scope.limit = 15;
    $scope.routePages = new Array();
    $scope.pageIndex = 0;
    $scope.pageType = 0;
    $scope.route = {};
    $scope.finishing = false;

    // initialize
    getPageInfos();

    $scope.switchPage = function(type) {
        $scope.pageType = type;
        getPageInfos();
    }

    $scope.switchRoutePage = function(index) {
        $scope.pageIndex = index;
        getRoutes();
    }

    $scope.dateChange = function() {
        getPageInfos();
    }

    $scope.viewDetail = function(index) {
        $scope.page.pageName = 'ViewRouteDetail';

        $scope.page.route = tool.deepCopy($scope.routes[index]);

        route.getRouteDetail($scope.page.route);
    }

    $scope.finish = function(index) {
        $scope.finishing = true;
        $http({url: '/admin/route/finish', method: 'POST', data: {id: $scope.routes[index].id}})
        .success(function(res) {
            $scope.finishing = false;
            if (res.status == 'success') {
                alert('操作完成，请手动刷新页面');
            }
            else if (res.status == 'error') {
                alert('error: ' + res.data);
                console.log(res.data);
            }
        })
    }

    $scope.delete = function(index) {
        if ($scope.routes[index].personsPaid != 0) {
            alert("已经有人购买此条路线，无法删除");
            return;
        }
        $http({url: "/admin/route/delete", method: "POST", data: {id: $scope.routes[index].id}})
        .success(function(res) {
            if (res.status == "success") {
                $scope.routes.splice(index, 1);
            }
            else if (res.status == 'error') {
                alert("error: " + res.data);
                console.log(res.data);
            }
        });
    }

    function getPageInfos() {
        getRouteCount();
        getRoutes();
    }

    function getRoutes() {
        if ($scope.pageType == 0) {
            $http({url: "/admin/route/list", method: "POST", 
                data: {skip: getSkip(), limit: getLimit(), startTime: getStartTime(), endTime: getEndTime()}})
            .success(function(res) {
                // console.log(res);
                if (res.status == "success") {
                    $scope.routes = res.data;
                    for (var i = 0; i < $scope.routes.length; i++) {
                        $scope.routes[i].startTime = tool.getTimeString(new Date($scope.routes[i].startTime));
                        $scope.routes[i].price = $scope.routes[i].price/100;
                        $scope.routes[i].duration = $scope.routes[i].duration/60/1000;
                    }
                }
                else if (res.status == 'error') {
                    alert(res.data);
                }
            });
        }
        if ($scope.pageType == 1) {
            $http({url: '/admin/route/unfinishedList', method: 'POST', 
                data: {skip: getSkip(), limit: getLimit(), startTime: getStartTime(), endTime: getEndTime()}})
            .success(function(res) {
                // console.log(res);
                if (res.status == "success") {
                    $scope.routes = res.data;
                    for (var i = 0; i < $scope.routes.length; i++) {
                        $scope.routes[i].startTime = tool.getTimeString(new Date($scope.routes[i].startTime));
                        $scope.routes[i].price = $scope.routes[i].price/100;
                        $scope.routes[i].duration = $scope.routes[i].duration/60/1000;
                    }
                }
                else if (res.status == 'error') {
                    alert(res.data);
                }
            });
        }
    }

    function getRouteCount() {
        if ($scope.pageType == 0) {
            $scope.routePages = new Array();
            $scope.pageIndex = 0;
            $http({url: '/admin/route/count', method: 'POST', data: {startTime: getStartTime(), endTime: getEndTime()}})
            .success(function(res) {
                if (res.status == 'success') {
                    var routePageNum = Math.ceil(res.data / $scope.limit);
                    for (var i = 0; i < routePageNum; i++) {
                        $scope.routePages.push(i + 1);
                    }
                }
            });
        }
        if ($scope.pageType == 1) {
            $scope.routePages = new Array();
            $scope.pageIndex = 0;
            $http({url: '/admin/route/unfinishedCount', method: 'POST', data: {startTime: getStartTime(), endTime: getEndTime()}})
            .success(function(res) {
                if (res.status == 'success') {
                    var routePageNum = Math.ceil(res.data / $scope.limit);
                    for (var i = 0; i < routePageNum; i++) {
                        $scope.routePages.push(i + 1);
                    }
                }
            });
        }
    }

    function getStartTime() {
        var startTime = null;
        if ($scope.route.date != null) {
            startTime = $scope.route.date.getTime();
        }
        return startTime;
    }

    function getEndTime() {
        var endTime = null;
        if (getStartTime() != null) {
            endTime = getStartTime() + 60*60*24*1000;
        }
        return endTime;
    }

    function getSkip() {
        return $scope.limit * $scope.pageIndex;
    }

    function getLimit() {
        return $scope.limit;
    }
}])
.controller('ViewRouteDetail', ['$scope', '$http', 'page', 'route', function ViewRouteDetail($scope, $http, page, route) {
    $scope.page = page;
    $scope.rightBarHead = "default";
    $scope.rightBarItems = [];
    $scope.rightBarType = 0;
    $scope.itemIndex = 0;
    $scope.schedule = {};
    $scope.carTypes = [];
    $scope.showSms = false;
    $scope.checkSendSms = 0;
    $scope.sms = {};

    $http({url: '/admin/car/list', method: 'POST'})
    .success(function(res) {
        if (res.status == 'success') {
            // console.log(res.data);
            $scope.carTypes = res.data;
        }
        else if (res.status == 'error') {
            alert('error: ');
        }
    });

    $scope.addSchedule = function() {
        $http({url: '/admin/schedule/add', method: 'POST', data: {id: $scope.page.route.id}})
        .success(function(res) {
            if (res.status == 'success') {
                res.data.link = page.host + ':' + page.port + '/checkTicket/check.html?id=' + res.data.id;
                $scope.page.route.schedules.push(res.data);
            }
            else if (res.status == 'error') {
                alert('error: ' + res.data);
            }
        });
    }

    $scope.distriPassengers = function() {
        $http({url: '/admin/ticket/autoDistribute', method: 'POST',  data: {id: $scope.page.route.id}})
        .success(function(res) {
            if (res.status == 'success') {
                route.getRouteDetail($scope.page.route);
                alert("分配成功");
            }
            else if (res.status == 'error') {
                alert("error: " + res.data);
                console.log(res.data);
            }
        });
    }

    $scope.exportUserInfo = function() {
        window.open('/admin/route/down/' + $scope.page.route.id);
    }

    $scope.save = function(index) {
        $http({url: '/admin/schedule/update', method: 'POST', 
            data: {schedule: $scope.page.route.schedules[index]}})
        .success(function(res) {
            if (res.status == 'success') {
                alert('保存成功');
            }
            else if (res.status == 'error') {
                alert('error: ' + res.data);
            }
        });
    }

    $scope.delete = function(index) {
        $http({url: '/admin/schedule/delete', method: 'POST', 
            data: {id: $scope.page.route.schedules[index].id}})
        .success(function(res) {
            console.log(res);
            if (res.status == 'success') {
                route.getRouteDetail($scope.page.route);
                alert('删除成功');
            }
            else if (res.status == 'error') {
                alert("error: ");
                console.log(res.data);
            }
        })
    }

    $scope.showPassenger = function(index) {
        $scope.rightBarItems = [];
        for (var i = 0; i < route.tickets.length; i++) {

        }
    }

    $scope.showRightBar = function(type, index) {
        $scope.schedule = {};
        $scope.itemIndex = index;
        $scope.rightBarType = type;
        switch(type) {
        case 1:
            $scope.rightBarHead = "检票员";
            $scope.rightBarItems = $scope.tellers;
            break;
        case 2:
            $scope.rightBarHead = "车辆类型";
            $scope.rightBarItems = $scope.carTypes;
            break;
        case 3:
            $scope.rightBarHead = "乘客信息";
            $scope.rightBarItems = [];
            for (var i = 0; i < page.route.tickets.length; i++) {
                if (page.route.tickets[i].scheduleId == page.route.schedules[index].id) {
                    $scope.rightBarItems.push(page.route.tickets[i].passenger);
                }
            }
            break;
        }
    }

    $scope.checked = function(index) {
        switch($scope.rightBarType) {
        case 1:
            $scope.page.route.schedules[$scope.itemIndex].teller = JSON.parse($scope.schedule.teller);
            break;
        case 2:
            $scope.page.route.schedules[$scope.itemIndex].totalSeat = parseInt(JSON.parse($scope.schedule.carType).totalSeat);
            $scope.page.route.schedules[$scope.itemIndex].company = JSON.parse($scope.schedule.carType).company;
            break;
        case 3:
            break;
        }
        $scope.rightBarType = 0;
    }

    $scope.sendSms = function(index) {
        if ($scope.checkSendSms == 0) {
            $scope.checkSendSms = 1;
            setTimeout(function() {
                $scope.checkSendSms = 0;
            }, 200);
            return;
        }
        $http({url: '/admin/sms/sendScheduleSms', method: 'POST', data: {scheduleId: $scope.sms.scheduleId, notice: $scope.sms.notice}})
        .success(function(res) {
            if (res.status == 'success') {
                alert('发送短信成功');
                $scope.showSms = false;
            }
            else if (res.status == 'error') {
                alert('error' + res.data);
                console.log(res.data);
            }
        })
    }

    $scope.hideRightBar =function() {
        $scope.rightBarType = 0;
    }

    $scope.showSmsPanel = function(index) {
        $scope.sms.scheduleId = $scope.page.route.schedules[index].id;
        $scope.sms.notice = '';
        $scope.showSms = true;
    }

    $scope.hideSmsPanel = function() {
        $scope.showSms = false;
    }
}])
.controller('PublishRoute', ['$scope', '$http', 'page', function PublishRoute($scope, $http, page) {
    $scope.page = page;
    $scope.iTime = {time0: false};
    $scope.startLocation = {name: "起点"};
    $scope.startLocations = [];
    $scope.endLocation = {name: "终点"};
    $scope.endLocations = [];
    $scope.locations = [];
    $scope.route = {};
    $scope.showStartLocationOpt = false;
    $scope.showEndLocationOpt = false;


    $http({url: "/admin/location/list", method: "POST"})
    .success(function (res) {
        if (res.status == "success") {
            $scope.locations = res.data;
        }
        else if (res.status == 'error') {
            alert ("error: " + res.data);
        }
    });

    $scope.showTime = function(index) {
        $scope.iTime[index] = true;
    }

    $scope.showStartLocation = function() {
        $scope.showStartLocationOpt = !$scope.showStartLocationOpt;
    }

    $scope.showEndLocation = function() {
        $scope.showEndLocationOpt = !$scope.showEndLocationOpt;
    }

    $scope.startItemClick = function(dom) {
        $scope.startLocation = dom.item;
        // $scope.startLocation.id = dom.item.id;
        // $scope.startLocation.name = dom.item.name;
        $scope.showStartLocationOpt = false;
    }

    $scope.endItemClick = function(dom) {
        $scope.endLocation = dom.item;
        // $scope.endLocation.id = dom.item.id;
        // $scope.endLocation.name = dom.item.name;
        $scope.showEndLocationOpt = false;
    }

    $scope.submit = function() {
        if ($scope.startLocation.id==null || $scope.endLocation.id==null || $scope.route.srcStop==null || $scope.route.destStop==null ||
            $scope.route.startTime==null || $scope.route.durationTime==null || $scope.route.price==null || $scope.route.notice==null) {
            alert("信息不完整");
            return;
        }
        var startTime = $scope.route.startTime.getTime();
        var durationTime = $scope.route.durationTime * 60 * 1000;
        var price = $scope.route.price * 100;
        $http({url: '/admin/route/add', method: 'POST', 
            data: {src: $scope.startLocation, dest: $scope.endLocation, 
                srcStop: $scope.route.srcStop, destStop: $scope.route.destStop,
                startTime: startTime, durationTime: durationTime,
                price: price, notice: $scope.route.notice}})
        .success(function(res) {
            if(res.status == "success")
                alert("发布路线成功");
            else if (res.status == 'error') {
                alert("error: " + res);
            }
        });
    }

    // // $http({url: "/admin/consoleCollege/getCollegeAll", method: "POST"})
    // // .success (function (res) {
    // //     $scope.collegeArray = res;
    // // });
    // $scope.showCollegeProvince = function() {
    //     $scope.collegeProvince = {name: '--省'};
    //     $scope.collegeCity = {name: '--市'};
    //     $scope.college = {name: '--大学'};
    //     for (var i = 0; i < $scope.collegeArray.length; i ++) {
    //         if ($scope.collegeItemArray.indexOf($scope.collegeArray[i].Province) == -1) {
    //             $scope.collegeItemArray.push($scope.collegeArray[i].Province);
    //         }
    //     }
    // }
    // $scope.showCollegeCity = function() {
    //     $scope.collegeCity = {name: '--市'};
    //     $scope.college = {name: '--大学'};
    //     for (var i = 0; i < $scope.collegeArray.length; i ++) {
    //         if ($scope.collegeArray[i].Province == $scope.collegeProvince.name) {
    //             if ($scope.collegeItemArray.indexOf($scope.collegeArray[i].City) == -1) {
    //                 $scope.collegeItemArray.push($scope.collegeArray[i].City);
    //             }
    //         }
    //     }
    // }
    // $scope.showCollege = function() {
    //     $scope.college = {name: '--大学'};
    //     for (var i = 0; i < $scope.collegeArray.length; i ++) {
    //         if ($scope.collegeArray[i].Province == $scope.collegeProvince.name
    //             && $scope.collegeArray[i].City == $scope.collegeCity.name) {
    //             $scope.collegeItemArray.push($scope.collegeArray[i].College);
    //         }
    //     }
    // }
    // $scope.showHomeProvince = function() {
    //     $scope.homeProvince = {name: '--省', objectId: 0};
    //     $scope.homeCity = {name: '--市', objectId: 0};
    //     $http({url: "/admin/consoleCollege/getProvince", method: "POST"})
    //     .success(function(res) {
    //         $scope.homeItemArray = res;
    //     });
    // }
    // $scope.showHomeCity = function() {
    //     if ($scope.homeProvince.objectId == 0)
    //         return;
    //     $scope.homeCity = {name: '--市', objectId: 0};
    //     $http({url: "/admin/consoleCollege/getCity", method: "POST", data: {provinceId: $scope.homeProvince.objectId}})
    //     .success(function(res) {
    //         $scope.homeItemArray = res;
    //     });
    // }

    // $scope.collegeItemClick = function(dom) {
    //     $scope.collegeItemArray = [];
    //     if ($scope.collegeProvince.name == '--省') {
    //         $scope.collegeProvince.name = dom.item;
    //         $scope.showCollegeCity();
    //     }
    //     else if ($scope.collegeCity.name == '--市') {
    //         $scope.collegeCity.name = dom.item;
    //         $scope.showCollege();
    //     }
    //     else if ($scope.college.name == '--大学') {
    //         $scope.college.name = dom.item;
    //     }
    // }
    // $scope.homeItemClick = function(dom) {
    //     $scope.homeItemArray = [];
    //     if ($scope.homeProvince.name == '--省') {
    //         $scope.homeProvince.name = dom.item.name;
    //         $scope.homeProvince.objectId = dom.item.objectId;
    //         $scope.showHomeCity();
    //     }
    //     else if ($scope.homeCity.name == '--市') {
    //         $scope.homeCity.name = dom.item.name;
    //         $scope.homeCity.objectId = dom.item.objectId;
    //     }
    // }

    // //route type click
    // $scope.changeRouteType = function(type) {
    //     $scope.routeType = type;
    // }

    // // $scope.submit = function() {
    // //     //check if is completed
    // //     if ($scope.collegeProvince.name == '--省' || $scope.collegeCity.name == '--市' || $scope.college.name == '--大学'
    // //         || $scope.homeProvince.name == '--省' || $scope.homeCity.name == '--市') {
    // //         return;
    // //     }

    // //     $http({url: "/admin/consoleRoute/addRoute", method: "POST", 
    // //         data: {college: $scope.college.name, home: $scope.homeCity.name, routeType: $scope.routeType}})
    // //     .success(function (res) {
    // //         if (res == "success")
    // //             alert("添加成功");
    // //     });
    // //     // console.log($scope.collee)
    // //     // console.log($scope.routeType);
    // // }
}])
.controller('ViewUncheckedRoute', ['$scope', '$http', 'page', 'tool', function ViewUncheckedRoute($scope, $http, page, tool) {
    $scope.page = page;
    $scope.uncheckedRoutes = [];
    $http({url: "/admin/route/uncheckedRouteList", method: "POST", data: {skip: 0, limit: 15}})
    .success(function(res) {
        if (res.status == 'success') {
            $scope.uncheckedRoutes = res.data;
            for (var i = 0; i < $scope.uncheckedRoutes.length; i++) {
                $scope.uncheckedRoutes[i].time = tool.getTimeString(new Date($scope.uncheckedRoutes[i].time));
            }
        }
        else if (res.status == 'error') {
            alert('error: ');
            console.log(res.data);
        }
    });
}])
.controller('ViewUncheckedRouteDetail', ['$scope', '$http', 'page', function ViewUncheckedRouteDetail($scope, $http, page) {
    $scope.page = page;
    
}]);
