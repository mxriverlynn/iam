var AsyncSpec = require("jasmine-async")(jasmine);
var helpers = require("./helpers");
var IAm = require("../iam/iam");

describe("logged in user", function(){

  describe("when a user is already logged in and hits a route", function(){
    var async = new AsyncSpec(this);

    var httpRequest, httpResponse, session;
    var getUserFromToken, token;

    async.beforeEach(function(done){
      var iam = new IAm();
      session = {};
      token = {id: 1};
      session[helpers.tokenName] = token;
      
      getUserFromToken = jasmine
        .createSpy("get user from token")
        .andCallFake(helpers.getUserFromToken);

      iam.configure(function(config){
        config.getUserToken(helpers.getUserToken);
        config.getUserFromToken(getUserFromToken);
      });

      var request = helpers.setupRoute(iam, session, function(req, res, next){
        httpRequest = req;
        httpResponse = res;
        res.send({});
      });

      request(function(err, res){
        if (err) { throw err; }
        done();
      });
    });

    it("should load user from session token", function(){
      expect(getUserFromToken).toHaveBeenCalledWith(token, jasmine.any(Function));
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

  describe("when not user logged in, and hitting a route", function(){
    var async = new AsyncSpec(this);

    var httpRequest, httpResponse, session;
    var getUserFromToken;

    async.beforeEach(function(done){
      var iam = new IAm();
      session = {};
      
      getUserFromToken = jasmine
        .createSpy("get user from token");

      iam.configure(function(config){
        config.getUserToken(helpers.getUserToken);
        config.getUserFromToken(getUserFromToken);
      });

      var request = helpers.setupRoute(iam, session, function(req, res, next){
        httpRequest = req;
        httpResponse = res;
        res.send({});
      });

      request(function(err, res){
        if (err) { throw err; }
        done();
      });
    });

    it("should not load user from session token", function(){
      expect(getUserFromToken).not.toHaveBeenCalled();
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

});

