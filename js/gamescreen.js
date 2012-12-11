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
  };
  
  this.target = null;  // An entity, or an object with a 'position' property, to track
  
  this.track_speed = 50;

  this.track_tolerance = 100;
  
  this.layers = $('#layers');

  this.moving = false;
  
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

  this.stayInBounds(moveto);
  
  this.viewport.center = moveto;

  var left = this.viewport.halfsize[0] - this.viewport.center[0],
      top = this.viewport.halfsize[1] - this.viewport.center[1];

  this.layers[0].style.left = parseInt(left)+'px';
  this.layers[0].style.top = parseInt(top)+'px';

  this.moving = true;
};

GameScreen.prototype.stayInBounds = function(position) {
  if (position[0] > this.viewport.slot.right) {
    position[0] = this.viewport.slot.right;
  } else if (position[0] < this.viewport.slot.left) {
    position[0] = this.viewport.slot.left;
  }

  if (position[1] > this.viewport.slot.bottom) {
    position[1] = this.viewport.slot.bottom;
  } else if (position[1] < this.viewport.slot.top) {
    position[1] = this.viewport.slot.top;
  }
};

var new_position = [0, 0], center;
GameScreen.prototype.moveBy = function(vector) {
  center = this.viewport.center;

  new_position[0] = center[0] + vector[0];
  new_position[1] = center[1] + vector[1];
   
  this.stayInBounds(new_position);

  this.viewport.center = new_position;
   
  this.layers[0].style.left = parseInt(this.viewport.halfsize[0] - new_position[0])+'px';
  this.layers[0].style.top = parseInt(this.viewport.halfsize[1] - new_position[1])+'px';

  this.moving = true;
};

var distance_sq, direction, vector = [0, 0];

GameScreen.prototype.update = function(msDuration) {
  this.moving = false;

  if (!this.target) return;
  
  if (this.viewport.center != this.target.position) {
    distance_sq = vectors.distance_sq(this.target.position, this.viewport.center); 

    if (distance_sq < Math.pow(this.track_tolerance, 2)) return;

    direction = vectors.unit(vectors.subtract(this.target.position, this.viewport.center));
    vector[0] = direction[0] * 100 * msDuration;
    vector[1] = direction[1] * 100 * msDuration;
    this.moveBy(vector); 
  }
};

GameScreen.prototype.draw = function(display) {
  gamejs.draw.rect(display, '#ffff00', this.viewport.slot, 2);
  gamejs.draw.circle(display, '#ff00ff', this.viewport.center, this.track_tolerance, 2);
};
