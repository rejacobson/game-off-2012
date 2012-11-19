var gamejs = require('gamejs');
var canvas = require('./canvas');
var settings = require('./settings');
var game = require('./game');

function main() {
  var g = game.init(); 
  g.start();
}

gamejs.ready(main);
