var gamejs = require('gamejs');
var canvas = require('./canvas');
var settings = require('./settings');
var game = require('./game');
var dialog = require('dialog');

function main() {
  var g = game.init(); 
  g.start();
  dialog.init(g);
  dialog.show('splash'); 
}

gamejs.ready(main);
