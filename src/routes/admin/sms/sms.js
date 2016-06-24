var router = require('express').Router();
var AV = require('leanengine');
var moment = require('moment');
var ticketMethods = require('../ticket/ticket');
var scheduleMethods = require('../schedule/schedule');

router.post('/testSms', function(req ,res) {
	AV.Cloud.requestSmsCode({
        template: "scheduleSmsV2",
  		mobilePhoneNumber: '18317013550',
  		name: 'JIKE',
  		order_no: '123456',
  		message: '欢迎登车',
  		ttl: 5
	}).then(function(){
  		res.send({status: 'success'});
	}, function(err){
		res.send({status: 'error', data: err});
	});
});

function sendSms(phones, template, params) {
    var promises = [];

    var uniquePhones = [];
    for (var i = 0; i < phones.length; i++) {
        if (uniquePhones.indexOf(phones[i]) == -1) {
            uniquePhones.push(phones[i]);
        }
    }

    for (var i = 0; i < uniquePhones.length; i++) {
        var data = {};
        data.template = template;
        data.mobilePhoneNumber = uniquePhones[i];
        for (j in params) {
            data[j] = params[j];
        }
        promises.push(AV.Cloud.requestSmsCode(data));
    }
    return AV.Promise.all(promises);
}

router.post('/sendScheduleSms', function(req, res) {
    var scheduleId = req.body.scheduleId;
    var notice = req.body.notice;
    var phones = [];
    var data = {notice: notice};
    var template = 'scheduleSmsV2';

    scheduleMethods.getScheduleById(scheduleId)
    .then(function(result) {
        data.src = result.get('route').get('source').get('location');
        data.dest = result.get('route').get('dest').get('location');
        data.time = moment(result.get('route').get('startTime')).format('YYYY-MM-DD HH:mm:ss');
        data.stop = result.get('route').get('sourceBusStop');
        data.plate = result.get('plateNumber');
        data.name = result.get('tellerName');
        data.phone = result.get('tellerPhone');

        return ticketMethods.getTicketListByScheduleId(scheduleId);
    })
    .then(function(results) {
        for (var i = 0; i < results.length; i++) {
            phones.push(results[i].get('passenger').get('phone'));
        }

        return sendSms(phones, template, data);
    })
    .then(function() {
        res.send({status: 'success'});
    }, function(err) {
        res.send({status: 'error', data: err})
    });
});

module.exports = router;