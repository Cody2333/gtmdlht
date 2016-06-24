var router = require('express').Router();



router.post('/signIn', function(req, res) {
  if (req.body.name == "admin" && req.body.password == "instcar") {
    req.session.admin = true;
    res.send("success");
  } else {
    res.send("error");
  }
});

router.post('/signOut', function(req, res) {
  req.session.admin = false;
  res.send("success");
});

module.exports = router;
