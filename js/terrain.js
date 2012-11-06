var gamejs = require('gamejs');
var spatialpartition = require('spatialpartition');

/////////////////////////////////////
// Platforms
/////////////////////////////////////
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





/////////////////////////////////////
// Poles
/////////////////////////////////////
var PoleManager = exports.PoleManager = function(width, buckets) {
  spatialpartition.Grid.call(this, {
    map_size: [width, 1],
    cells: [buckets, 1]
  });
};
PoleManager.prototype = Object.create(spatialpartition.Grid.prototype);

PoleManager.prototype.insert = function(pole) {
  var index = this.mapIndex([pole.left, 1]),
      poles = this.mapFetch(index, []);
      
  poles.push(pole);
  
  if (poles.length > 1) {
    poles.sort(function(a, b) { a.left - b.left });
  }
  
  return pole;
};

PoleManager.prototype.findClosest = function(rect) {
  var x = rect.center[0];
  if (x > this.settings.map_size[0]) return false;
  
  var index = this.mapIndex([x, 1]);
  var poles = _.compact(this.mapFetch([index-1, index, index+1]));
  
  if (poles.length) {
    for (var i=0; i<poles.length; ++i) {
      p = poles[i];
      if (rect.left < p.left &&
          rect.right > p.left && 
          rect.bottom > p.top + 2  &&
          rect.top < p.bottom) {
        return p;
      }
    }
  }
  
  return null;
};

PoleManager.prototype.mergeOverlapping = function(pole) {
  var self = this,
      index = this.mapIndex([pole.left, 1]),
      poles = this.mapFetch(index);
      
  poles = _.without(poles, pole);
  poles = _.filter(poles, function(p) {
    return p.left == pole.left && !(p.top >= pole.bottom+3 || p.bottom <= pole.top-3);
  });
  
  if (!poles.length) return;
  
  _.each(poles, function(p) {
    pole.top = p.top = Math.min(p.top, pole.top);
    pole.bottom = p.bottom = Math.max(p.bottom, pole.bottom);
  });
};

PoleManager.prototype.draw = function(display) {
  _.each(this.map, function(bucket) {
    _.each(bucket, function(pole) {
      pole.draw(display);
    });
  });
};



var Pole = exports.Pole = function(top, bottom, left, settings) {
  this.top = top;
  this.bottom = bottom;
  this.left = left;

  var defaults = {
    is_ground: false
  };

  this.settings = _.extend(defaults, settings);
};

Pole.prototype.height = function() {
  return this.bottom - this.top;
};

Pole.prototype.draw = function(display) {
  gamejs.draw.line(display, '#0000ff', [this.left, this.top], [this.left, this.bottom], 1);
};
