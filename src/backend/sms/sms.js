var AV = require('leanengine');

function sendSmsManyP(phones, template, params) {
	var promises = [];

    for (var i = 0; i < phones.length; i++) {
        var data = {};
        data.template = template;
        data.mobilePhoneNumber = phones[i];
        for (var j in params) {
            data[j] = params[j];
        }
        promises.push(AV.Cloud.requestSmsCode(data));
    }
    return AV.Promise.all(promises);
}

exports.sendSmsManyP = sendSmsManyP;