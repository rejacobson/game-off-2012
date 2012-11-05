var gamejs = require('gamejs');
var spatialpartition = require('spatialpartition');

var PlatformManager = exports.PlatformManager = function(height, buckets) {
  spatialpartition.Grid.call(this, {
    map_size: [1, height],
    cells: [1, buckets]
  });
};
PlatformManager.prototype = Object.create(spatialpartition.Grid.prototype);

PlatformManager.prototype.insert = function(platform) {
  var index = this.mapIndex([1, platform.top]),
      platforms = this.mapFetch(index, []);
      
  platforms.push(platform);
  
  if (platforms.length > 1) {
    platforms.sort(function(a, b) { a.top - b.top });
  }
  
  return platform;
};

PlatformManager.prototype.findClosest = function(position) {
  if (position[1] > this.settings.map_size[1]) return false;
  
  var index = this.mapIndex([1, position[1]]);
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
      index = this.mapIndex([1, platform.top]),
      platforms = this.mapFetch(index);
      
  platforms = _.without(platforms, platform);
  platforms = _.filter(platforms, function(p) {
    return p.top == platform.top && !(p.left >= platform.right+3 || p.right <= platform.left-3);
  });
  
  if (!platforms.length) return;
  
  _.each(platforms, function(p) {
    platform.left = p.left = Math.min(p.left, platform.left);
    platform.right = p.right = Math.max(p.right, platform.right);
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

  var defaults = {
    is_ground: false
  };

  this.settings = _.extend(defaults, settings);
};

Platform.prototype.width = function() {
  return this.right - this.left;
};

Platform.prototype.draw = function(display) {
  gamejs.draw.line(display, '#ff0000', [this.left, this.top], [this.right, this.top], 1);
};
