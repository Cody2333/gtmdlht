var AV = require('leanengine');
var User = AV.User;

function packup(user) {
	if (user == null) {
		return null;
	}
	var result = {};
	result.id = user.id;
	result.name = user.get("username");
	result.phone = user.get("mobilePhoneNumber");
	result.idnum = user.get("IDnumber");
	return result;
}

function getUserList(skip, limit) {
	var userQuery = new AV.Query(User);
	if (skip != null) {
		userQuery.skip(skip);
	}
	if (limit != null) {
		userQuery.limit(limit);
	}
	userQuery.descending("createdAt");
	return userQuery.find();
}

function getUserById(id) {
	var userQuery = new AV.Query(User);
	return userQuery.get(id);
}

function getTellerList(skip, limit) {
	var userQuery = new AV.Query(User);
	if (skip != null) {
		userQuery.skip(skip);
	}
	if (limit != null) {
		userQuery.limit(limit);
	}
	userQuery.equalTo('isMember', true);
	// userQuery.equalTo('isDeleted', false);
	return userQuery.find();
}

function getUserCount() {
	var userQuery = new AV.Query(User);
	// userQuery.equalTo('isDeleted', false);
	return userQuery.count();
}

function getUserByUserId(userId) {
	var userQuery = new AV.Query(User);
	// userQuery.equalTo('isDeleted', false);
	return userQuery.get(userId);
}

function getUserByPhone(phone) {
	var userQuery = new AV.Query(User);
	userQuery.equalTo('mobilePhoneNumber', phone);
	// userQuery.equalTo('isDeleted', false);
	return userQuery.find();
}

exports.packup = packup;
exports.getUserList = getUserList;
exports.getTellerList = getTellerList;
exports.getUserById = getUserById;
exports.getUserCount = getUserCount;
exports.getUserByUserId = getUserByUserId;
exports.getUserByPhone = getUserByPhone;