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
        iam.createUserSession(req, res, helpers.user, function(err){
          res.send({});
        });
      });

      request(function(err, res){
        if (err) { throw err; }
        done();
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
      expect(httpResponse.locals.user).toBe(helpers.user);
    });

    it("should indicate logged in on response locals", function(){
      expect(httpResponse.locals.loggedIn).toBe(true);
    });

  });

});
