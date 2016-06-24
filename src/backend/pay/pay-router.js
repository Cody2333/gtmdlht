//！！！！已弃用！！！！
var pay = require('express').Router();
var AV = require('leanengine');

// `AV.Object.extend` 方法一定要放在全局变量，否则会造成堆栈溢出。
// 详见： https://leancloud.cn/docs/js_guide.html#对象
var Order = AV.Object.extend("Order");
var Route = AV.Object.extend("Route");
var password="JIKE193473KKKKK2928273747";
var pingpp = require('pingpp')('sk_test_er9KW1v5Oqj9ujTmjTrHGSGS');
//发起支付请求
pay.post('/pay', function(req,res) {
	// pingpp.parseHeaders(/*headers*/); // 把从客户端传上来的 Headers 传到这里
	console.log(req.body);
	console.log("do pay");
	console.log(req.ip);
	console.log(req.body.amount);
	var startindex=req.ip.lastIndexOf(':');
	var ip;
	if(startindex==-1){
		ip=req.ip;
	}else{
		ip=req.ip.substring(startindex+1);
	}
	var channel = req.body.channel;
	var extra = {};
	//支付宝和微信支付的回调，暂时没有设置
	switch (channel) {
	case 'alipay_wap':
		extra = {
		'success_url': 'http://www.yourdomain.com/success',
		'cancel_url': 'http://www.yourdomain.com/cancel'
		};
		break;
	case 'upacp_wap':
		extra = {
		'result_url': 'http://www.yourdomain.com/result?code='
		};
		break;
	}

	pingpp.charges.create({
        subject: "Ticket",
        body: "ticket of jike",
        amount: req.body.amount,
        order_no: req.body.order_no,
        channel: channel,
        currency: "cny",
        client_ip: ip,
        app: {id: "app_Xv1CWDOqv18Knvfz"},
		description: password
    }, function(err, charge) {
        console.log('this is '+err);
		console.log('charge in function '+charge.id)
		res.send(charge);
    });
});


//处理ping++的支付结果
pay.post("/result",function(req,res){
	console.log("do result");
	var queryod = new AV.Query(Order);
	queryod.include("Route");
	queryod.equalTo("OrderNumber",req.body.order_no);
	queryod.find({
		success: function(result){
			if(result.length!=1){
				console.log("订单号重复");
			}
			if(req.body.paid){
				//订单的路线
				if(req.body.description==password){
					var route = result[0].get("Route");
					//获取订单的手机号列表
					var phoneList = result[0].get("PassengerPhoneList");
					//获取订单的乘客列表
					var nameList = result[0].get("PassengerNameList");
					var carStartTime = route.get("CarStartTime");
					var carStartPlace = route.get("StartPlace") + route.get("StartExactPlace");
					for(var i = 0;i<phoneList.length;i++){
					//发短信提示支付成功
						AV.Cloud.requestSmsCode({
							mobilePhoneNumber: phoneList[i],
							template : "乘客订单信息",
							name : nameList[i],
							order_no : req.body.order_no,
							start_time : carStartTime,
							start_exact_place : carStartPlace,
							ttl : 5
						}).then(function(){
							console.log("发送成功");
						},function(err){
							console.log("发送失败"+err);
						});
					}
					result[0].set("PayState",req.body.paid);
					result[0].save();
				}
			}
		},
		error: function(error){
			console.log("Error: "+ error.code + " " + error.message);
		}
	});
	res.send("success");
});

module.exports = pay;
