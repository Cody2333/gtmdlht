var AV = require('leanengine');
var Order = AV.Object.extend("Order");
var CodeGen = require('./backend/discode/discode');
var couponMethod = require('./backend/coupon/coupon');
var Discode = AV.Object.extend("DiscountCode");
var moment = require('moment');


//定期删除订单函数
AV.Cloud.define("clear_orders",function(req,res){
	var queryOrder=new AV.Query(Order);
	queryOrder.equalTo("PayState",false);
	queryOrder.find({
		success: function(result){
			var now = moment();
			console.log("clear_orders at : "+now.toString());
			for(var i=0;i<result.length;i++){
				if(moment(result[i].getCreatedAt()).isBefore(moment().subtract(1,"hours"))){
					result[i].destroy({
						success: function(order) {
							// The object was deleted from the LeanCloud.
							console.log("order_no : "+order.get("OrderNumber") + " deleted");
						},
						error: function(order, error) {
							// The delete failed.
							// error is a AV.Error with an error code and description.
							console.log("order_no : "+order.get("OrderNumber") + " delete failed : "+error);
						}
					});
				}
			}
		},
		error: function(error){
			console.log("clear_orders error : "+error);
		}
	});
	return res.success();
});



/*
生成用户优惠码函数
*/
AV.Cloud.define("generate_user_discode",function(req,res){
	var userId=req.params.userId;
	if(userId!=null){
		var queryUser = new AV.Query(AV.User);
		queryUser.get(userId,{
			success : function(user){
				CodeGen.genUniqDiscode(user,function(error){
					if(error==null){
						res.success();
					}else{
						res.error(error);
					}
				});
			},error : function(user, error){
				res.error(error);
			}
		});
	}else{
		var user=AV.User.current();
		if(user==null){
			res.error("no current user");
		}else{
			CodeGen.genUniqDiscode(user,function(error){
				if(error==null){
					res.success();
				}else{
					res.error(error);
				}
			});
		}
	}
});

AV.Cloud.define("generate_all_user_discode",function(req,res){
	CodeGen.genAllUserCode();
	res.success();
});

AV.Cloud.define("find_coupon",function(req,res){
	var user=AV.User.current();
	couponMethod.findCouponOfUser(user,function(error,result){
		if(error!=null){
			res.error(error);
			return;
		}else{
			res.success(result);
			return;
		}
	});
});

AV.Cloud.define("get_coupon_by_discode",function(req,res){
	var user=AV.User.current();
	if(user==null){
		res.error("user does not log in");
		return;
	}else{
		var discode=req.params.discode;
		if(discode==null){
			res.error("discode is null");
			return;
		}else{
			couponMethod.getCouponByDiscode(user,discode,function(error){
				if(error==null){
					res.success();
					return;
				}else{
					res.error(error);
					return;
				}
			});
		}
	}
});
module.exports = AV.Cloud;
