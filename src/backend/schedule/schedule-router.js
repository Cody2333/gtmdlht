var AV = require('leanengine');
var router = require('express').Router();
var commonRes = require('../common-response');
var scheduleMethod = require('./schedule');

/*查看指定schedule的详细信息
params	:scheduleId
send	:{
			err,
			ret: schedule
		}
*/
router.post('/view',function(req,res){
	var id = req.body.scheduleId;
	scheduleMethod.scheduleInfoP(id).then(function(schedule){
		var schArray = [];
		schArray.push(schedule);
		res.json({
			err :{
				code : 0,
				des : ""
			} ,
			ret : {
				schedule : scheduleMethod.avScheduleToFrontSchedule(schArray)[0]
			}
		});
	},function(error){
		commonRes.unknownError(res,2,error);
	});
});

module.exports = router;