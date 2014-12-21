var TOKEN_NAME = "_iam-user-token";

// Middleware
// ----------

function Middleware(config){
  this.config = config;
  this.handler = this.handler.bind(this);
}

Middleware.prototype.handler = function(req, res, next){
  var that = this;

  if (!req.session){
    var err = new Error("No session object found. Please configure a session middlware.");
    err.name = "SessionNotFound";
    return next(err);
  }

  req.createUserSession = this.createUserSession.bind(this, req, res, next);
  req.destroyUserSession = this.destroyUserSession.bind(this, req, res, next);
  res.locals.iam = {};

  var token = req.session[TOKEN_NAME];
  if (!token){
    this.destroyUserSession(req, res, next);
    return next();
  }

  this.config.getUserFromToken(token, function(err, user){
    if (err) { return next(err); }
    that._setSessionData(req, res, user);
    return next();
  });
};

Middleware.prototype.createUserSession = function(req, res, next, user, cb){
  var that = this;
  var config = this.config;

  if (!req.session){
    var err = new Error("No session object found. Please configure a session middlware.");
    err.name = "SessionNotFound";
    return next(err);
  }

  if (!user) {
    that.destroyUserSession(req, res, next);
    return cb();
  }

  config.getUserToken(user, function(err, token){
    if (err) { return cb(err); }

    req.session[TOKEN_NAME] = token;
    that._setSessionData(req, res, user);
    return cb();
  });
};

Middleware.prototype.destroyUserSession = function(req, res, next){
  req.session[TOKEN_NAME] = undefined;
  req.user = undefined;
  res.locals.iam.user = undefined;
  res.locals.iam.loggedIn = false;
};


Middleware.prototype._setSessionData = function(req, res, user){
  req.user = user;
  res.locals.iam.user = user;
  res.locals.iam.loggedIn = !!(user);
};

module.exports = Middleware;
