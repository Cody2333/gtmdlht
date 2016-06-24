angular.module('app', ['ui.bootstrap', 'ui.bootstrap.datetimepicker'])
  .factory('page', function() {
    return {
      pageName: 'DiscountRule',
      user: {},
      userOrder: [],
      passengers: [],
      agent: {}
    };
  })
  .controller('PageController', ['$scope', 'page', function PageController($scope, page) {
    $scope.page = page;
    $scope.switchPage = function(pageName) {
      $scope.page.pageName = pageName;
    }
  }])
  .service('tool', function() {
    this.getNewDate = function(date) {
      if (date == null) {
        return null;
      } else {
        return new Date(date);
      }
    }
    this.getTime = function(date) {
      if (date == null) {
        return null;
      } else {
        return date.getTime();
      }
    }

    this.switchToRealFunction = function(mockFunc) {
      var result = 'function(priceBefore) {\n\
			var x = priceBefore / 100;\n\
			var z;\n';
      result += mockFunc;
      result += '\nreturn z * 100;}';
      return result;
    }

    this.switchToMockFunction = function(realFunc) {
      var firstIndex = realFunc.indexOf('var z;');
      var secondIndex = realFunc.indexOf('\nreturn z * 100;}');
      return realFunc.substring(firstIndex + 7, secondIndex);
    }
  })
  .service('getBasicInfo', function($http, tool) {
    this.getLocations = function(array) {
      array.length = 0;
      $http({
        url: '/admin/location/list',
        method: 'POST'
      })
        .success(function(res) {
          if (res.status == 'success') {
            for (var i = 0; i < res.data.length; i++) {
              array.push(res.data[i]);
            }
          } else if (res.status == 'error') {
            alert('error in showLocation');
            console.log(res.data);
          }
        });
    }

    this.getDiscountRules = function(array) {
      array.length = 0;
      $http({
        url: '/admin/coupon/discountRuleList',
        method: 'POST',
        data: {
          skip: 0,
          limit: 20
        }
      })
        .success(function(res) {
          if (res.status == 'success') {
            for (var i = 0; i < res.data.length; i++) {
              res.data[i].mockFunction = tool.switchToMockFunction(res.data[i].discountFunction);
              array.push(res.data[i]);
            }
          } else if (res.status == 'error') {
            alert('error in getDiscountCodes');
            console.log(res.data);
          }
        });
    }

    this.getDiscountCodes = function(array) {
      array.length = 0;
      $http({
        url: '/admin/coupon/discountCodeList',
        method: 'POST',
        data: {
          skip: 0,
          limit: 20
        }
      })
        .success(function(res) {
          if (res.status == 'success') {
            // console.log(res.data);
            for (var i = 0; i < res.data.length; i++) {
              res.data[i].validDate = tool.getNewDate(res.data[i].validDate);
              res.data[i].couponValidStartTime = tool.getNewDate(res.data[i].couponValidStartTime);
              res.data[i].couponValidEndTime = tool.getNewDate(res.data[i].couponValidEndTime);
              array.push(res.data[i]);
            }
          } else if (res.status == 'error') {
            alert('error in getDiscountCodes');
            console.log(res.data);
          }
        });
    }
  })
  .controller('MemberCode', ['$scope', '$http', 'page', 'getBasicInfo', function MemberCode($scope, $http, page, getBasicInfo) {
    $scope.page = page;
    $scope.iTime = {
      time0: false,
      time1: false,
      time2: false
    };
    $scope.pageType = 0;
    $scope.discountCodes = [];
    $scope.discountCode = {};
    $scope.rightBarType = 0;
    $scope.rightBarItems = [];
    $scope.rightBarHead = 'default';
    $scope.discountCodeInfo = {};
    $scope.indexChecked;

    getPageInfos();

    $scope.switchPage = function(type) {
      $scope.pageType = type;
      getPageInfos();
    }

    $scope.showTime = function(index) {
      $scope.iTime[index] = true;
    }

    $scope.showDiscountRule = function(type, index) {
      $scope.rightBarType = type;
      $scope.rightBarHead = '优惠规则列表';
      if (index != null) {
        $scope.indexChecked = index;
      }
      getBasicInfo.getDiscountRules($scope.rightBarItems);
    }

    $scope.showLocation = function(type, index) {
      $scope.rightBarType = type;
      $scope.rightBarHead = '地址列表';
      if (index != null) {
        $scope.indexChecked = index;
      }
      getBasicInfo.getLocations($scope.rightBarItems);
    }

    $scope.add = function() {
      if ($scope.discountCode.code == null || $scope.discountCode.name == null || $scope.discountCode.discountRule == null || $scope.discountCode.couponValidPrice == null) {
        alert('有一些必填项一定要输入');
        return;
      }
      if ($scope.discountCode.couponValidSrc == null) {
        $scope.discountCode.couponValidSrc = {};
      }
      $http({
        url: '/admin/coupon/addDiscountCode',
        method: 'POST',
        data: {
          name: $scope.discountCode.name,
          show: $scope.discountCode.show,
          code: $scope.discountCode.code,
          validDate: getTime($scope.discountCode.validDate),
          couponValidPrice: $scope.discountCode.couponValidPrice,
          couponValidSrcId: $scope.discountCode.couponValidSrc.id,
          couponValidStartTime: getTime($scope.discountCode.couponValidStartTime),
          couponValidEndTime: getTime($scope.discountCode.couponValidEndTime),
          discountRuleId: $scope.discountCode.discountRule.id
        }
      })
        .success(function(res) {
          if (res.status == 'success') {
            alert('添加成功');
          } else if (res.status == 'error') {
            alert('error: ' + res.data);
            console.log(res.data);
          }
        });
    }

    $scope.saveDiscountCode = function(index) {
      if ($scope.discountCodes[index].couponValidSrc == null) {
        $scope.discountCodes[index].couponValidSrc = {};
      }
      if ($scope.discountCodes[index].couponValidPrice == null) {
        $scope.discountCodes[index].couponValidPrice = 0;
      }
      $http({
        url: '/admin/coupon/updateDiscountCode',
        method: 'POST',
        data: {
          discountCodeId: $scope.discountCodes[index].id,
          show: $scope.discountCodes[index].show,
          validDate: getTime($scope.discountCodes[index].validDate),
          discountRuleId: $scope.discountCodes[index].discountRule.id,
          couponValidPrice: $scope.discountCodes[index].couponValidPrice,
          couponValidSrcId: $scope.discountCodes[index].couponValidSrc.id,
          couponValidStartTime: getTime($scope.discountCodes[index].couponValidStartTime),
          couponValidEndTime: getTime($scope.discountCodes[index].couponValidEndTime)
        }
      })
        .success(function(res) {
          if (res.status == 'success') {
            alert('修改成功');
          } else if (res.status == 'error') {
            alert('error: ' + res.data);
            console.log(res.data);
          }
        });
    }

    $scope.checked = function() {

      switch ($scope.rightBarType) {
        case 1:
          $scope.discountCode.discountRule = JSON.parse($scope.discountCodeInfo.discountRule);
          break;
        case 2:
          $scope.discountCode.couponValidSrc = JSON.parse($scope.discountCodeInfo.location);
          break;
        case 3:
          $scope.discountCodes[$scope.indexChecked].discountRule = JSON.parse($scope.discountCodeInfo.discountRule);
          break;
        case 4:
          $scope.discountCodes[$scope.indexChecked].couponValidSrc = JSON.parse($scope.discountCodeInfo.location);
        default:
          break;
      }
      $scope.rightBarType = 0;
    }

    $scope.hideRightBar = function() {
      $scope.rightBarType = 0;
    }

    function getPageInfos() {
      if ($scope.pageType == 0) {
        getBasicInfo.getDiscountCodes($scope.discountCodes);
      }
      if ($scope.pageType == 1) {

      }
    }

    function getTime(date) {
      if (date == null) {
        return null;
      }
      else
        return date.getTime();
    }
  }])
  .controller('DiscountRule', ['$scope', '$http', 'page', 'getBasicInfo', 'tool', function DiscountRule($scope, $http, page, getBasicInfo, tool) {
    $scope.page = page;
    $scope.pageType = 0;
    $scope.discountRules = [];
    $scope.discountRule = {};

    getPageInfos();

    $scope.switchPage = function(type) {
      $scope.pageType = type;
      getPageInfos();
    }

    $scope.getTestResult = function() {
      var test = eval('(' + tool.switchToRealFunction($scope.discountRule.discountFunction) + ')');
      $scope.discountRule.result = test($scope.discountRule.inputPrice * 100) / 100;
    }

    $scope.add = function() {
      if ($scope.discountRule.description == null || $scope.discountRule.discountFunction == null) {
        alert("请检查输入");
        return;
      }
      $http({
        url: '/admin/coupon/addDiscountRule',
        method: 'POST',
        data: {
          description: $scope.discountRule.description,
          discountFunction: tool.switchToRealFunction($scope.discountRule.discountFunction)
        }
      })
        .success(function(res) {
          if (res.status == 'success') {
            alert('添加成功');
          } else if (res.status == 'error') {
            alert('error in add function');
            console.log(res.data);
          }
        });
    }

    function getPageInfos() {
      if ($scope.pageType == 0) {
        getBasicInfo.getDiscountRules($scope.discountRules);
      }
      if ($scope.pageType == 1) {

      }
    }
  }])
  .controller('UserDiscountCode', ['$scope', '$http', 'page', 'getBasicInfo', function UserDiscountCode($scope, $http, page, getBasicInfo) {
    $scope.page = page;
    $scope.userDiscountRuleMap = {};
    $scope.rightBarType = 0;
    $scope.rightBarItems = [];
    $scope.rightBarHead = 'default';
    $scope.userDiscountRuleMapInfo = {};

    getPageInfos();

    $scope.save = function() {
      if ($scope.userDiscountRuleMap == null || $scope.userDiscountRuleMap.id == null || $scope.userDiscountRuleMap.show == null) {
        alert('请填写必要项');
        return;
      }
      var validTime = $scope.userDiscountRuleMap.validTime * 24 * 60 * 60 * 1000;
      var validPrice = $scope.userDiscountRuleMap.validPrice * 100;
      $http({
        url: '/admin/coupon/updateDiscountRuleMap',
        method: 'POST',
        data: {
          discountRuleMapId: $scope.userDiscountRuleMap.id,
          show: $scope.userDiscountRuleMap.show,
          validPrice: validPrice,
          validTime: validTime,
          discountRuleId: $scope.userDiscountRuleMap.discountRule.id
        }
      })
        .success(function(res) {
          if (res.status == 'success') {
            alert('保存成功');
          } else if (res.status == 'error') {
            alert('error in save');
            console.log(res.data);
          }
        })
    }

    $scope.showDiscountRule = function() {
      $scope.rightBarType = 1;
      $scope.rightBarHead = '优惠规则';
      getBasicInfo.getDiscountRules($scope.rightBarItems);
    }

    $scope.hideRightBar = function() {
      $scope.rightBarType = 0;
    }

    $scope.checked = function() {
      $scope.userDiscountRuleMap.discountRule = JSON.parse($scope.userDiscountRuleMapInfo.discountRule);
      $scope.rightBarType = 0;
    }

    function getPageInfos() {
      $http({
        url: '/admin/coupon/userDiscountRuleMap',
        method: 'POST'
      })
        .success(function(res) {
          if (res.status == 'success') {
            res.data.validPrice = res.data.validPrice / 100;
            res.data.validTime = res.data.validTime / 1000 / 24 / 60 / 60;
            $scope.userDiscountRuleMap = res.data;
          } else if (res.status == 'error') {
            alert('error in getPageInfos');
            console.log(res.data);
          }
        });
    }
  }])
  .controller('DistributeCoupon', ['$scope', '$http', 'page', 'getBasicInfo', 'tool', function DistributeCoupon($scope, $http, page, getBasicInfo, tool) {
    $scope.page = page;
    $scope.iTime = {
      time0: false
    };
    $scope.coupon = {};
    $scope.rightBarType = 0;
    $scope.rightBarItems = [];
    $scope.rightBarHead = 'default';
    $scope.couponInfo = {};


    $scope.showTime = function(index) {
      $scope.iTime[index] = true;
    }

    $scope.showLocation = function(type) {
      $scope.rightBarType = type;
      $scope.rightBarHead = "地点列表";
      getBasicInfo.getLocations($scope.rightBarItems);
    }

    $scope.showDiscountRule = function(type) {
      $scope.rightBarType = type;
      $scope.rightBarHead = "优惠规则";
      getBasicInfo.getDiscountRules($scope.rightBarItems);
    }

    $scope.hideRightBar = function() {
      $scope.rightBarType = 0;
    }

    $scope.checked = function() {
      switch ($scope.rightBarType) {
        case 1:
          $scope.coupon.discountRule = JSON.parse($scope.couponInfo.discountRule);
          break;
        case 2:
          $scope.coupon.validSrc = JSON.parse($scope.couponInfo.location);
          break;
        case 3:
          $scope.coupon.validDest = JSON.parse($scope.couponInfo.location);
          break;
        default:
          break;
      }
      $scope.rightBarType = 0;
    }

    $scope.add = function() {
      if ($scope.coupon.discountRule == null || $scope.coupon.show == null) {
        alert('名称和规则一定要输入');
        return;
      }
      if ($scope.coupon.validDest == null) {
        $scope.coupon.validDest = {};
      }
      if ($scope.coupon.validSrc == null) {
        $scope.coupon.validSrc = {};
      }
      $http({
        url: '/admin/coupon/distribute',
        method: 'POST',
        data: {
          show: $scope.coupon.show,
          discountRuleId: $scope.coupon.discountRule.id,
          validSrcId: $scope.coupon.validSrc.id,
          validDestId: $scope.coupon.validDest.id,
          validPrice: $scope.coupon.validPrice * 100,
          validEndTime: tool.getTime($scope.coupon.validEndTime)
        }
      })
        .success(function(res) {
          if (res.status == 'success') {
            alert('发放优惠券成功');
          } else if (res.status == 'error') {
            alert('error in Distribute Coupon');
            console.log(res.data);
          }
        });
    }
  }])
  .controller('DonateCoupon', ['$scope', '$http', 'page', 'getBasicInfo', 'tool', function DonateCoupon($scope, $http, page, getBasicInfo, tool) {
    $scope.page = page;
    $scope.step = 0;
    $scope.users = [];
    $scope.user = {};
    $scope.coupon = {};
    $scope.err = 0;
    $scope.errorInfo = 'default';
    $scope.couponInfo = {};
    $scope.rightBarType = 0;
    $scope.rightBarItems = [];
    $scope.rightBarHead = 'default';
    var checkTime = true;

    $scope.search = function() {
      $http({
        url: '/admin/user/getByPhone',
        method: 'POST',
        data: {
          phone: $scope.user.phone
        }
      })
        .success(function(res) {
          if (res.status == 'success') {
            if (res.data == null) {
              $scope.err = 1;
              $scope.step = 0;
              $scope.errorInfo = '找不到该手机号的用户';
            } else {
              $scope.err = 0;
              $scope.step = 1;
              $scope.user = res.data;
            }
          } else {
            alert('error');
            console.log(res.data);
          }
        })
    }

    $scope.userPhoneChange = function() {
      $scope.err = 0;
      $scope.step = 0;
    }

    $scope.addPhone = function() {
      $scope.users.push($scope.user);
      $scope.user = {};
      $scope.step = 0;
    }

    $scope.showDiscountRule = function() {
      $scope.rightBarType = 1;
      $scope.rightBarHead = "优惠规则";
      getBasicInfo.getDiscountRules($scope.rightBarItems);
    }

    $scope.checked = function() {
      $scope.coupon.discountRule = JSON.parse($scope.couponInfo.discountRule);
      $scope.rightBarType = 0;
    }

    $scope.hideRightBar = function() {
      $scope.rightBarType = 0;
    }

    $scope.donateCoupon = function() {
      if (checkTime == true) {
        checkTime = false;
        setTimeout(function() {
          checkTime = true;
        }, 2000);
        return;
      }
      checkTime = true;

      if ($scope.users.length == 0 || $scope.coupon.discountRule == null || $scope.coupon.show == null) {
        alert('请检查输入');
        return;
      }
      $http({
        url: '/admin/coupon/donate',
        method: 'POST',
        data: {
          users: $scope.users,
          show: $scope.coupon.show,
          discountRuleId: $scope.coupon.discountRule.id
        }
      })
        .success(function(res) {
          if (res.status == 'success') {
            alert('赠送优惠券成功');
          } else {
            alert('error: ' + res.data);
            console.log(res);
          }
        })
    }
  }]);
