var gamejs = require('gamejs');
var vectors = gamejs.utils.vectors;
var canvas = require('canvas');

/*
<div id="viewport">
  <div id="layers">
    <canvas id="background"></canvas>
    <canvas id="main"></canvas>
    <canvas id="foreground"></canvas>
  </div>
  <canvas id="hud"></canvas>
</div>
*/

var gamescreen = null;

exports.instance = function() {
  if (!gamescreen) {
    gamescreen = new GameScreen([1200, 550]);
  }
  return gamescreen;
};

var GameScreen = function(screen_size) {
  this.viewport = {
    element: $('#viewport'),
    size: screen_size,
    halfsize: [screen_size[0]/2, screen_size[1]/2],
    center: [0, 0],  // Where the center of the viewport is relative to the layered canvases
    slot: null // gamejs.Rect - The center of the viewport should only be able to move within this slot
  };
  
  this.displays = {
    background: canvas.registerCanvas('background', screen_size),
    main: canvas.registerCanvas('main', screen_size),
    foreground: canvas.registerCanvas('foreground', screen_size),
    hud: canvas.registerCanvas('hud', screen_size)
  };
  
  this.target = null;  // An entity, or an object with a 'position' property, to track
  
  this.track_speed = 50;
  
  this.layers = $('#layers');
  
  // Setup the dom elements
  _.each(_.keys(this.displays), function(d, index) {
    $('#'+ d).css({position:'absolute', left:0, top:0, zIndex:index});
  });
  
  this.layers.css({position:'absolute', left:0, top:0});

  this.viewport.element.css({width:screen_size[0], height:screen_size[1], position:'relative', overflow:'hidden'}).show();
};

GameScreen.prototype.display = function(type) {
  return this.displays[type];
};

GameScreen.prototype.levelSize = function(size) {
  var self = this;
  
  _.each(['background', 'main', 'foreground'], function(d) {
    self.displays[d] = self.displays[d].resize(size);
  });
  
  this.viewport.slot = new gamejs.Rect(this.viewport.halfsize, vectors.subtract(size, this.viewport.halfsize));
};

GameScreen.prototype.clear = function() {
  _.each(_.keys(this.displays), function(d) {
    d.clear();
  });
};

GameScreen.prototype.track = function(target) {
  if (!target.position) return;
  this.target = target;
};

GameScreen.prototype.moveTo = function(position) {
  if (!this.viewport.slot.collidePoint(position)) return;
  
  this.viewport.center = position;

  var left = this.viewport.halfsize[0] - this.viewport.center[0],
      top = this.viewport.halfsize[1] - this.viewport.center[1];

  this.layers.css({left:left, top:top});
};

GameScreen.prototype.update = function(msDuration) {
  if (!this.target) return;
  
  if (this.viewport.center != this.tracker.position) {
    var direction = vectors.unit(vectors.subtract(this.tracker.position, this.viewport.center)),
        vector = vectors.multiply(direction, this.track_speed * msDuration),
        position = vectors.add(this.viewport.center, vector);
    
    this.moveTo(position);
  }
};
