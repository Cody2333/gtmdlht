var AV = require('leanengine');
var AgentInfo = AV.Object.extend('AgentInfo');
var orderMethod = require('./order/order');
/*定时清理订单*/
AV.Cloud.define('clear_time_out_order',function(req,res){ 
	orderMethod.deleteTimeOutOrderP().then(function(){
		res.success();
	},function(error){
		console.log(error);
		res.success();
	});
});

/*每月清理代理的上个月活跃人数*/
AV.Cloud.define('clear_live_consumer',function(req,res){  
	var count = 0;
	var end = false;
	var promise = AV.Promise.as();
	for(var i = 0; i < 10; i++){
		promise = promise.then(function(){
			var query = new AV.Query(AgentInfo);
			query.equalTo('isDeleted',false);
			return query.find.then(function(results){
				count += results.length;
				if(results.length == 0){
					end = true;
					return;
				}
				for(var i = 0; i < results.length; i++){
					results[i].set('preliveConsumer',results[i].get('liveConsumer'));
					results[i].set('liveConsumer',0);
					results[i].save();
				}
			});
		});
	}
	console.log('clear live consumer ok!');
	res.success();
});

module.exports = AV.Cloud;