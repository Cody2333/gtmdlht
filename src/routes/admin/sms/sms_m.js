var AV = require('leanengine');

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

exports.sendSms = sendSms;