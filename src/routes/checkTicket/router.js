var router = require('express').Router();

router.use('/sign', require('./sign'));
router.use('/', function(req, res, next) {
	if (req.session.check == true) {
		next();
	}
	else {
		res.send({status: 'login'});
	}
});

router.use('/ticket', require('./ticket'));

module.exports = router;