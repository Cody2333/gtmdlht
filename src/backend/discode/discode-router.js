var AV = require('leanengine');
var discodeRoute= require('express').Router();
var CodeGen= require('./discode');
var commonRes = require('../common-response');

discodeRoute.post('/view',function(req,res){
	var user = req.AV.user;
	if(user.get('myDiscountCode') != null){
		res.json({
			err : {
				code : 0,
				des : ""
			},
			ret :{
				discode : user.get('myDiscountCode')
			}
		});
	}else{
		CodeGen.genDiscountCodeForUserP(user).then(function(){
			return user.fetch();
		}).then(function(result){
			res.json({
				err : {
					code : 0,
					des : ""
				},
				ret : {
					discode : result.get('myDiscountCode')
				}
			});
		},function(error){
			commonRes.unknownError(res,2,error);
		});
	}
});

module.exports=discodeRoute;