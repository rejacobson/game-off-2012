var MersenneTwister = require('mersenne').MersenneTwister;
var SimplexNoise = require('simplex-noise').SimplexNoise;

var twister, simplex;

// Seed the random number and simplex noise generators
var seed = exports.seed = function(num) {
  if (!num) num = (new Date()).getTime();
  twister = new MersenneTwister(num);
  simplex = new SimplexNoise(function() { return twister.random() });
};

// Seeded Random Numbers
var random = exports.random = {
  next: function(){
    if (!twister) seed(); 
    return twister.random();
  },

  range: function(min, max) {
    if (arguments.length == 1) {
      max = min;
      min = 0;
    }
    return Math.round(min + random.next() * (max - min));
  }
};

// 2D Simplex Noise
var noise = exports.noise = {
  get: function(x, y) {
    if (!simplex) seed();
    return simplex.noise2D(x, y);  
  },

  percentage: function(x, y) {
    return Math.round((this.get(x, y) * 0.5 + 0.5) * 100);
  }
};
