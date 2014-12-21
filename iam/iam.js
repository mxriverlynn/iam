var Configurator = require("./configurator");
var Middleware = require("./middleware");

function IAm(){
  this.configurator = new Configurator();
}

IAm.prototype.configure = function(cb){
  cb(this.configurator);
};

IAm.prototype.middleware = function(){
  var config = this.configurator.getConfig();
  var middleware = new Middleware(config);
  return middleware.handler;
};

module.exports = IAm;
