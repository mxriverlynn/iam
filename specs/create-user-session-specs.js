var AsyncSpec = require("jasmine-async")(jasmine);
var helpers = require("./helpers");
var IAm = require("../iam/iam");

describe("create user session", function(){

  describe("when creating a user session from a user object", function(){
    var async = new AsyncSpec(this);

    var httpRequest, httpResponse, session;

    async.beforeEach(function(done){
      var iam = new IAm();
      session = {};

      iam.configure(function(config){
        config.getUserToken(helpers.getUserToken);
        config.getUserFromToken(helpers.getUserFromToken);
      });

      var request = helpers.setupRoute(iam, session, function(req, res, next){
        httpRequest = req;
        httpResponse = res;
        req.createUserSession(helpers.user, function(err){
          res.send({});
        });
      });

      request(function(err, res){
        if (err) { throw err; }
        done(err);
      });
    });

    it("should set a user token in session", function(){
      expect(session[helpers.tokenName]).not.toBe(undefined);
      expect(session[helpers.tokenName].id).toBe(helpers.user.id);
    });

    it("should set the user on the request", function(){
      expect(httpRequest.user).toBe(helpers.user);
    });

    it("should set the user on the response locals", function(){
      expect(httpResponse.locals.iam.user).toBe(helpers.user);
    });

    it("should indicate logged in on response locals", function(){
      expect(httpResponse.locals.iam.loggedIn).toBe(true);
    });

  });

  describe("when creating a user session from undefined", function(){
    var async = new AsyncSpec(this);

    var httpRequest, httpResponse, session, user;

    async.beforeEach(function(done){
      var iam = new IAm();
      session = {};
      user = undefined;

      iam.configure(function(config){
        config.getUserToken(helpers.getUserToken);
        config.getUserFromToken(helpers.getUserFromToken);
      });

      var request = helpers.setupRoute(iam, session, function(req, res, next){
        req.createUserSession(user, function(err){
          httpRequest = req;
          httpResponse = res;
          res.send({});
        });
      });

      request(function(err, res){
        if (err) { throw err; }
        done();
      });
    });

    it("should not set a user token in session", function(){
      expect(session[helpers.tokenName]).toBe(undefined);
    });

    it("should not set the user on the request", function(){
      expect(httpRequest.user).toBe(undefined);
    });

    it("should not set the user on the response locals", function(){
      expect(httpResponse.locals.iam.user).toBe(undefined);
    });

    it("should indicate not logged in on response locals", function(){
      expect(httpResponse.locals.iam.loggedIn).toBe(false);
    });

  });

  describe("if no request.session exists", function(){
    var async = new AsyncSpec(this);

    var response;

    async.beforeEach(function(done){
      var iam = new IAm();
      var session = undefined;

      iam.configure(function(config){
        config.getUserToken(helpers.getUserToken);
        config.getUserFromToken(helpers.getUserFromToken);
      });

      var request = helpers.setupRoute(iam, session, function(req, res, next){
        res.send({});
      });

      request(function(err, res){
        if (err) { throw err; }
        response = res;
        done();
      });
    });

    it("should throw an error", function(){
      helpers.expectResponseError(response, "No session object found. Please configure a session middlware.", "SessionNotFound");
    });
  });

});
