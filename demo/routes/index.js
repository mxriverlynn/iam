var home = require("./home");
var login = require("./login");

var express = require('express');
var router = express.Router();

router.use("/", home);
router.use("/login", login);

module.exports = router;
