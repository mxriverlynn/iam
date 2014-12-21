var express = require("express");
var supertest = require("supertest");

var user = {
  id: 1
};

var helpers = {
  tokenName: "_iam-user-token",

  user: user,

  setupRoute: function(iam, session, handler){
    var app = new express();

    app.use(function(req, res, next){
      req.session = session;
      next();
    });

    app.use(iam.middleware());

    var router = express.Router();
    router.get("/", handler);
    app.use("/", router);

    return function(cb){
      supertest(app)
        .get("/")
        .end(function(err, res){
          cb(err, res);
        });
    }
  },

  getUserToken: function(user, cb){
    var id; 
    if (user) { id = user.id; }
    return cb(null, {id: id});
  },

  getUserFromToken: function(token, cb){
    return cb(null, helpers.user);
  },

  expectResponseCode: function(response, code){
    if (response.status === 500){ 
      throw response.text;
    } else {
      expect(response.status).toBe(code);
    }
  },

  expectResponseError: function(response, message, errorType){
    if (!errorType) { errorType = "Error"; }

    var errorMessage = errorType + ": " + message
    expect(response.status).toBe(500);
    var idx = response.text.indexOf(errorMessage);
    expect(idx).toBe(0, "Expected error message '" + errorMessage + "', but got '" + response.text + "'");
  },

  expectRedirect: function(response, code, url){
    expect(response.status).toBe(code);
    expect(response.headers.location).toBe(url);
  }
};

module.exports = helpers;
