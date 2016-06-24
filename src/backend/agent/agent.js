var AV=require('leanengine');
var AgentInfo= AV.Object.extend("AgentInfo");
//获取绑定用户数，discodes为优惠码数组，callback为回调函数
/*function getBindingUserNumbers(discodes,callback){
	if(callback==null){
		return ;
	}
	if(discodes==null){
		callback("discodes is null");
		return;
	}
	var query=new AV.Query(AV.User);
	var result=new Array();
	var promise=AV.Promise.as();
	for(var i=0;i<discodes.length;i++){
		promise=promise.then(function(){
			query.equalTo("agentCode",discodes[i]);
			return query.count();
		});
		promise=promise.then(function(count){
			result.push(count);
		});
	}
	promise.then(function(){
		callback(null,result);
	},function(error){
		callback(error);
	});
}*/

//exports.getBindingUserNumbers=getBindingUserNumbers;
