function Middleware(config){
  this.config = config;
  this.handler = this.handler.bind(this);
}

Middleware.prototype.handler = function(req, res, next){
  if (!req.session) { return next(); }

  var token = req.session._iamUserToken;

  if (!token){
    req.user = undefined;
    res.locals.user = undefined;
    res.locals.loggedIn = false;
    return next();
  }

  this.config.getUserFromToken(token, function(err, user){
    if (err) { return next(err); }

    req.user = user;
    res.locals.user = user;
    res.locals.loggedIn = !!(user);
    next();
  });
};

module.exports = Middleware;
