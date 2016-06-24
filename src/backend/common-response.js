/*未登录错误信息
params	:res(express.res), code(number)
send	:err(json)
*/
function notLoginError(res,code){			
	if(res!=null){
		res.json({
			err : {
				code : code,
				des : "未登录"
			}
		});
	}
}

/*未知错误信息，基本都是leancloud的api返回的错误信息
params	:res(express.res), code(number), error(AV.Error)
send	:err(json)
*/
function unknownError(res,code,error){		
	if(res!=null){
		var msg = error;
		if(error.message != null){
			msg = error.message;
		}
		res.json({
			err :{
				code : code,
				des : msg
			}
		});
	}
}

/*成功信息
params	:res(express.res)
send	:err(json)
*/
function simpleSuccess(res){				
	if(res!=null){
		res.json({
			err : {
				code : 0,
				des : ""
			}
		})
	}
}

var commonPass = "111111";
exports.notLoginError=notLoginError;
exports.unknownError=unknownError;
exports.simpleSuccess=simpleSuccess;
exports.commonPass = commonPass;