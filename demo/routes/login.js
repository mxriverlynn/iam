var User = require("../lib/user");
var express = require("express");

var router = new express.Router();

router.get("/", function(req, res, next){
  res.render("login");
});

router.get("/logout", function(req, res, next){
  req.destroyUserSession();
  res.redirect("/");
});

router.post("/", function(req, res, next){
  var username = req.body.username;
  var password = req.body.password;

  User.login(username, password, function(err, user){
    if (err) { return next(err); }

    req.createUserSession(user, function(err){
      if (err) { return next(err); }

      res.redirect("/");
    });
  });
  
});

module.exports = router;
