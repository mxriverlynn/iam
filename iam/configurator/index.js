function Configurator(){
  this.config = {
  };
}

Configurator.prototype.getConfig = function(){
  return this.config;
};

Configurator.prototype.getUserToken = function(fn){
  this.config.getUserToken = fn;
};

Configurator.prototype.getUserFromToken = function(fn){
  this.config.getUserFromToken = fn;
};

module.exports = Configurator;
