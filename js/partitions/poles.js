var gamejs = require('gamejs');
var spatialpartition = require('spatialpartition');

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

  var defaults = { };

  this.settings = _.extend(defaults, settings);
};

Pole.prototype.height = function() {
  return this.bottom - this.top;
};

Pole.prototype.draw = function(display) {
  gamejs.draw.line(display, '#0000ff', [this.left, this.top], [this.left, this.bottom], 1);
};

