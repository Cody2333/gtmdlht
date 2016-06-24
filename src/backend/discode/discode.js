var AV = require('leanengine');
var moment=require('moment');

var Discode = AV.Object.extend("DiscountCode");
var DiscountRuleMap = AV.Object.extend("DiscountRuleMap");
var AgentInfo = AV.Object.extend("AgentInfo");

//从手机号码生成优惠码号，目测7位
function genDiscodeByPhone(phone){
	var codenum=new Array();
	if(phone==null){
		for(var index=0;index<6;index++){
			codenum.push(parseInt(Math.random()*36));
		}
	}else{
		var num=parseInt(phone);
		codenum.push(parseInt(Math.random()*36));
		while(num>1){
			codenum.push(parseInt(num)%36);
			index+=1;
			num=num/36;
		}
	}
	var codestr=new String();
	var aCode="a".charCodeAt(0);
	for(var i=0;i<codenum.length;i++){
		if(codenum[i]>=10){
			codestr+=String.fromCharCode(aCode+codenum[i]-10);
		}else{
			codestr+=codenum[i];
		}
	}
	return codestr;
}

//生成唯一优惠码号
function genUniqDiscodeP(user,times){
	if(user==null){
		console.log("user is null");
		return AV.Promise.error("user is null");
	}
	if(user.get("myDiscountCode")!=null){
		console.log("user :"+user.id+" already have a discount code");
		return AV.Promise.error("user :"+user.id+" already have a discount code");
	}
	if(user.get("isAgent")&&user.get("agentInfo")==null){
		return AV.Promise.error("did not implete agent info");
	}
	if(times>=8){
		return AV.Promise.error("codes are not enough");
	}
	var phone=user.getMobilePhoneNumber();
	var discode=genDiscodeByPhone(phone);
	//大于6位的优惠码号砍成6位的
	if(discode.length>6){
		discode=discode.substr(0,6);
	}
	var query = new AV.Query(AV.User);
	var promise= AV.Promise.as();
	query.equalTo("myDiscountCode",discode);
	promise=query.count();
	promise=promise.then(function(count){
		if(count!=0){
			return genUniqDiscodeP(user,times+1);
		}else{
			console.log("generate discode for user:"+user.id);
			user.fetchWhenSave(true);
			user.set("myDiscountCode",discode.toString());
			return user.save();
		}
	});
	return promise;
}

//为用户生成对应的优惠码
function genDiscountCodeForUserP(user){
	return genUniqDiscodeP(user,0);
}

//从优惠码规则列表中找到匹配的优惠码规则
function findAgentDisRuleMapP(user,prepromise){
	if(prepromise==null){
		prepromise=AV.Promise.as();
	}
	prepromise=prepromise.then(function(){
		var agentInfo=user.get("agentInfo");
		if(agentInfo==null){
			return AV.Promise.error("没有完善代理信息");
		}else{
			return agentInfo.fetch();
		}
	});
	return prepromise.then(function(agentInfo){
		var query = new AV.Query(DiscountRuleMap);
		var src=agentInfo.get("source");
		var dest=agentInfo.get("dest");
		if(src!=null){
			query.equalTo("source",src);
		}
		if(dest!=null){
			query.equalTo("dest",dest);
		}
		query.equalTo("type","agent");
		return query.find();
	});	
}

exports.genDiscodeByPhone=genDiscodeByPhone;
exports.genDiscountCodeForUserP=genDiscountCodeForUserP;