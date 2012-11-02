var gamejs = require('gamejs');
var canvas = require('./canvas');
var settings = require('./settings');
var game = require('./game');

function main() {
  var displays = {
    background: canvas.registerCanvas('background-canvas', [settings.get('SCREEN_WIDTH'), settings.get('SCREEN_HEIGHT')]),
    foreground: canvas.registerCanvas('foreground-canvas', [settings.get('SCREEN_WIDTH'), settings.get('SCREEN_HEIGHT')])
  };

  var g = game.init(); 
  g.start(displays);
}

gamejs.ready(main);
