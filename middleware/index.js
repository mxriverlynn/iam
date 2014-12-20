function Middleware(config){
  this.config = config;
  this.handler = this.handler.bind(this);
}

Middleware.prototype.handler = function(req, res, next){
  debugger;
  if (!req.session) { return next(); }

  var token = req.session._iamUserToken;
  this.config.getUserFromToken(token, function(err, user){
    debugger;
    if (err) { return next(err); }

    req.user = user;
    res.locals.user = user;
    next();
  });
};

module.exports = Middleware;
