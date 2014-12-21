# IAm: Simple authentication middleware for Node / Express apps

IAm is authentication plumbing and middleware for Node / Express
apps. It is not a complete framework, but rather is just the
parts that you need to manage a user being logged in, and
logged out. It is up to you to provide the actual user object,
the check to see whether or not they have authenticated
appropriately, etc. IAm will provide the Express middleware
to remember who they are once they have authenticated, and to 
forget them (log them out).

## Authentication, Not Authorization

IAm only provides authentication middleware - the code that
verifies you are who you say you are. If you need to also
verify that a user has permissions to do certain things,
I recommend my [mustBe](/derickbailey/mustbe) system.

## Demo App

There is a demo app located in the [demo folder](./demo) of
this repository. To run it, clone this repo, go in to that
folder and run:

```
npm install
npm start
```

Then visit localhost:3000 in your browser and you can see
a small demonstration of IAm, in action.

## Getting Started

IAm has one hard dependency that you must configure in your
Express application: a session provider. I recommend
[expressjs/session](/expressjs/session), but you can use
any session provider as long as it provides a `req.session`
attribute on the express request object.

### Install IAm

Once you have an express session provider configured, you can
install IAm.

```
npm install --save iam
```

### Configure IAm

IAm must be configured before it can be used. There are two
points of configuration to add. The first is used to retrieve
a token from the current user object. The second is used to
turn the previously retrieved token back in to a user object.

Start by creating an `iamConfig.js` file in your application.
Add the following, as an example configuration.

```js
// iamConfig.js
// ------------

// require your user object
var User = require("./user");

module.exports = function(iam){

  // get a user token from the currently logged in user
  iam.getUserToken(function(user, cb){
    var token = {
      id: user.id
    };

    cb(null, token);
  });

  // on subsequent requests, turn the user token in to
  // the actual user object
  iam.getUserFromToken(function(token, cb){

    // this is the token that we set, above
    // so grab the id and load the user
    var userId = token.id;
    User.findById(userId, function(err, user){
      if (err) { return cb(err); }

      // found the user, so return it here
      return cb(undefined, user);
    });
  });

};
```

Now, inside of your app.js file (or wherever you are
configuring Express) you can configure IAm with this file.

```js
// app.js
// ------

var iam = require("iam");
var iamConfig = require("./iamConfig");

var app = new express();

// this must be done before routes are set up
app.use(iam.middleware());

// ...
```

With IAm configured, you can use the `createUserSession` and
`destroyUserSession` methods to login and logout.

**A Important Note About Tokens**

DO NOT, under any circumstances, store a password in the
token that you create from the user object. Tokens are stored
on the user's session, which is typically stored as a cookie.
Even if you are using encrypted cookies, you run a great risk
of exposing passwords to the world if you put the password on
the token. Never do this. Ever. Always use some other tokenized
identifier from which a user can be loaded.

### Log In with createUserSession

In your login route handler, you should verify your user has
authenticated correctly and then call `req.createUserSession`
with the authenticated user object.

```js
// routes/login.js
// ---------------

var User = require("../user");

var express = require("express");
var router = new express.Router();

router.post("/login", function(req, res, next){
  
  // use your own custom login logic here
  var u = req.body.username;
  var p = req.body.password;
  User.login(u, p, function(err, result){
    if (err) { return next(err); }
    
    // if they logged in correctly, create a user session
    // so that they will be logged in again when they make
    // subsequent requests to the app

    if (result.authenticated){

      // use the `createUserSession` method, provided by IAm
      // the previously configured `getUserToken` method will
      // be called, to get a token and store it
      req.createUserSession(user, function(err){
        if (err) { return next(err); }

        // done logging in and creating the user session
        res.redirect("/awesome-stuff");
        
      });
    
    } else {
      response.redirect("/login?message=login failed");
    }
  });
});

module.exports = router;
```

The use of `req.createUserSession` will store the user's token
in the user's session. When subsequent requests are made to the
application, the IAm middleware will load the token and use the
`getUserFromToken` method to load the user again.

### Logout With destroyUserSession

Counterpoint to the `req.createUserSession` method is the
`req.destroyUserSession` method. This method will destroy the
token and other related data stored on the session, allowing the
user to be logged out. 

```js
// routes/logout.js
// ---------------

var User = require("../user");

var express = require("express");
var router = new express.Router();

router.post("/logout", function(req, res, next){

  // use the `destroyUserSession` method, provided by IAm,
  // to log the user out
  req.destroyUserSession();

  // done logging out and destroying the user session
  res.redirect("/");

});

module.exports = router;
```

The `req.destroyUserSession` method is entirely synchronous
and provides no return value. It destroys the session information
related to the user, and moved on.

This method only destroys the session info that was previously
created by IAm. You are responsible for ensuring any and all 
other details are destroyed, as needed. 

### Request and View Helpers

There are several helper objects and methods made available
by the IAm middleware. You have previously seen the use of
`req.createUserSession` and `req.destroyUserSession`, which are
useful during login / logout. When rendering a view, or when
working with a user object during other portions of your 
application, there are additional helpers avaialble.

#### req.user

A `req.user` attribute is available on the request object,
after the `req.createUserSession` method has completed, and
when each subsequent request has loaded the user by it's token.

```js
// /routes/someRouter.js

router.get("/foo", function(req, res, next){

  // get the current user
  var user = req.user;

  // do stuff with it ...

});

```

#### user and loggedIn View Helpers

During view rendering, you may need access to the user object
and may also want to know if the user is currently logged in
or not. Both of these bits of information are provided by
view helpers.

```jade

  - if (iam.loggedIn)
    h1 
      | You are logged in as
      = iam.user.name
  - else
    h2 You are not logged in.

```

## Legal Junk

IAm is &copy;2014 Muted Solutions, LLC. All Rights Reserved.

Distributed under [MIT License](http://mutedsolutions.mit-license.org).
