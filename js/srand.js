var MersenneTwister = require('mersenne').MersenneTwister;

var twister;

var seed = exports.seed = function(num) {
  if (!num) num = (new Date()).getTime();
  twister = new MersenneTwister(num);
};

var next = exports.next = function() {
  if (!twister) seed();
  return twister.random();
};

var range = exports.range = function(min, max) {
  if (arguments.length == 1) {
    max = min;
    min = 0;
  }
  return Math.round(min + next() * (max - min));
};
