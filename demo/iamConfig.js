var User = require("./lib/user");

module.exports = function(iam){

  iam.getUserToken(function(user, cb){
    var token = {
      username: user.username
    };

    cb(undefined, token);
  });

  iam.getUserFromToken(function(token, cb){
    var username = token.username;

    User.findByUsername(username, function(err, user){
      if (err) { return cb(err); }
      return cb(undefined, user);
    });
  });

};
