var gamejs = require('gamejs');
var settings = require('./settings');
var game = require('./game');

console.log(game);
// gamejs.preload([]);

function main() {
  var display = gamejs.display.setMode([settings.get('SCREEN_WIDTH'), settings.get('SCREEN_HEIGHT')]);
  var g = game.init(); 
  g.start(display);
}

gamejs.ready(main);
