var gamejs = require('gamejs');
var spatialpartition = require('spatialpartition');

// Ground texture
gamejs.preload(['images/ground.png']);


var PlatformManager = exports.PlatformManager = function(height, cellheight) {
  spatialpartition.Grid.call(this, [1, height], [1, cellheight]);
};
PlatformManager.prototype = Object.create(spatialpartition.Grid.prototype);

PlatformManager.prototype.insert = function(platform) {
  var index = this.mapIndex([0, platform.top]),
      platforms = this.mapFetch(index, []);
      
  platforms.push(platform);
  
  if (platforms.length > 1) {
    platforms.sort(function(a, b) { a.top - b.top });
  }
  
  return platform;
};

PlatformManager.prototype.findClosest = function(position) {
  if (position[1] > this.mapsize[1]) return false;
  
  var index = this.mapIndex([0, position[1]]);
  var platforms = _.compact(this.mapFetch([index, index+1]));
  
  if (platforms.length) {
    for (var i=0; i<platforms.length; ++i) {
       p = platforms[i];
       if (position[1] <= p.top && position[0] > p.left && position[0] < p.right) return p;
    }
  }
  
  return null;
};

PlatformManager.prototype.mergeOverlapping = function(platform) {
  var self = this,
      index = this.mapIndex([0, platform.top]),
      platforms = this.mapFetch(index);
      
  platforms = _.without(platforms, platform);
  platforms = _.filter(platforms, function(p) {
    return p.top == platform.top && !(p.left >= platform.right+3 || p.right <= platform.left-3);
  });
  
  if (!platforms.length) return;
  
  _.each(platforms, function(p) {
    if (platform.settings.fall_through == p.settings.fall_through) {
      platform.left = p.left = Math.min(p.left, platform.left);
      platform.right = p.right = Math.max(p.right, platform.right);
    }
  });
};

PlatformManager.prototype.draw = function(display) {
  _.each(this.map, function(bucket) {
    _.each(bucket, function(platform) {
      platform.draw(display);
    });
  });
};


var Platform = exports.Platform = function(left, right, top, settings) {
  this.left = left;
  this.right = right;
  this.top = top;
  this.height = 1;

  var defaults = {
    fall_through: true
  };

  this.settings = _.extend(defaults, settings);
};

Platform.prototype.width = function() {
  return this.right - this.left;
};

var ctx;
Platform.prototype.draw = function(display) {
  if (!this.settings.fall_through) {
    if (!this.settings.pattern) {
      var img = gamejs.image.load('images/ground.png');
      this.height = img.getSize()[1];
      this.settings.pattern = img.context.createPattern(img.canvas, 'repeat'); //display.context.createPattern(img.canvas, 'repeat');
    }

    ctx = display.context;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = this.settings.pattern;
    ctx.translate(this.left, this.top);
    ctx.fillRect(0, 0, this.right - this.left, this.height);
    ctx.translate(-this.left, -this.top);
    ctx.restore();
  } else {
    gamejs.draw.line(display, '#692B05', [this.left, this.top], [this.right, this.top], this.height);
  }
};

