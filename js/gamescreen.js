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
    background: canvas.register('background', screen_size),
    main: canvas.register('main', screen_size),
    foreground: canvas.register('foreground', screen_size),
    hud: canvas.register('hud', screen_size)
  };
  
  this.target = null;  // An entity, or an object with a 'position' property, to track
  
  this.track_speed = 50;

  this.track_tolerance = 100;
  
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
    self.displays[d] = canvas.resize(d, size);
  });
  
  this.viewport.slot = new gamejs.Rect(this.viewport.halfsize, vectors.subtract(size, this.viewport.size));

  this.moveTo(this.viewport.slot.center);
};

GameScreen.prototype.clear = function() {
  _.each(this.displays, function(d) {
    d.clear();
  });
};

GameScreen.prototype.follow = function(target) {
  if (!target.position) return;
  this.target = target;
};

GameScreen.prototype.moveTo = function(position) {
  // create a copy of the position, as it could be modified
  var moveto = position.slice(0);

  if (moveto[0] > this.viewport.slot.right) {
    moveto[0] = this.viewport.slot.right;
  } else if (moveto[0] < this.viewport.slot.left) {
    moveto[0] = this.viewport.slot.left;
  }

  if (moveto[1] > this.viewport.slot.bottom) {
    moveto[1] = this.viewport.slot.bottom;
  } else if (moveto[1] < this.viewport.slot.top) {
    moveto[1] = this.viewport.slot.top;
  }
  
  this.viewport.center = moveto;

  var left = this.viewport.halfsize[0] - this.viewport.center[0],
      top = this.viewport.halfsize[1] - this.viewport.center[1];

  this.layers.css({left:parseInt(left), top:parseInt(top)});
};

GameScreen.prototype.update = function(msDuration) {
  if (!this.target) return;
  
  if (this.viewport.center != this.target.position) {
    var distance = vectors.distance(this.target.position, this.viewport.center);

    if (distance < this.track_tolerance) return;
 
    var direction = vectors.unit(vectors.subtract(this.target.position, this.viewport.center)),
        vector = vectors.multiply(direction, distance * msDuration),
        position = vectors.add(this.viewport.center, vector);
    
    this.moveTo(position);
  }
};

GameScreen.prototype.draw = function(display) {
  gamejs.draw.rect(display, '#ffff00', this.viewport.slot, 2);
  gamejs.draw.circle(display, '#ff00ff', this.viewport.center, this.track_tolerance, 2);
};
