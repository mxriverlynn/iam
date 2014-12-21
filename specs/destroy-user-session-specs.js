var AsyncSpec = require("jasmine-async")(jasmine);
var helpers = require("./helpers");
var IAm = require("../iam/iam");

describe("destroy user session", function(){

  describe("when destroying a user session", function(){
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
          if (err) { return next(err); }

          req.destroyUserSession();

          res.send({});
        });
      });

      request(function(err, res){
        if (err) { throw err; }
        done(err);
      });
    });

    it("should clear the user token in session", function(){
      expect(session[helpers.tokenName]).toBe(undefined);
    });

    it("should clear the user on the request", function(){
      expect(httpRequest.user).toBe(undefined);
    });

    it("should clear the user on the response locals", function(){
      expect(httpResponse.locals.iam.user).toBe(undefined);
    });

    it("should indicate logged out on response locals", function(){
      expect(httpResponse.locals.iam.loggedIn).toBe(false);
    });

  });

});
