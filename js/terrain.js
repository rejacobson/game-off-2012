var gamejs = require('gamejs');

var PlatformManager = exports.PlatformManager = function(settings) {
  var defaults = {
    height: 500,
    buckets: 20
  };
  this.settings = _.extend(defaults, settings); 
  this.settings.bucket_size = this.settings.height / this.settings.buckets;

  this.spatial_partition = []; 
};

PlatformManager.prototype.insert = function(platform) {
  var index = this.getBucketIndex(platform.top);
  if (!this.spatial_partition[index]) this.spatial_partition[index] = [];
  this.spatial_partition[index].push(platform);
  if (this.spatial_partition[index].length > 1) {
    this.spatial_partition[index].sort(function(a, b) { return a - b; });
  }
  return platform;
};


PlatformManager.prototype.mergeOverlapping = function(platform) {
  var self = this;
  var index = this.getBucketIndex(platform.top);
  var platforms = this.platforms(index);

  platforms = _.filter(_.without(platforms, platform), function(p) {
    return p.top == platform.top && !(p.left >= platform.right+1 || p.right <= platform.left-1) 
  });

  if (platforms.length == 0) return;

  _.each(platforms, function(p) {
    platform.left = p.left = Math.min(p.left, platform.left);
    platform.right = p.right = Math.max(p.right, platform.right);
  });

};

PlatformManager.prototype.remove = function(platform) {
  var self = this;
  var index = this.getBucketIndex(platform.top);
  var platforms = this.platforms(index);

  _.each(platforms, function(p, i) {
    if (p == platform) {
      delete self.spatial_partition[index][i];
    }
  });
};

PlatformManager.prototype.getBucketIndex = function(y) {
  return Math.floor(y / this.settings.bucket_size);
};

PlatformManager.prototype.platforms = function(bucket) {
  return this.spatial_partition[bucket] || [];
};

PlatformManager.prototype.closestPlatform = function(position) {
  if (position[1] > this.settings.height) return false;

  var bucket = Math.floor(position[1]/this.settings.bucket_size);
  
  var platforms = this.platforms(bucket);
  platforms = platforms.concat(this.platforms(bucket+1));

  if (platforms.length) {
    var p;
    for (var i = 0; i<platforms.length; i++) {
      p = platforms[i];
      if (position[1] <= p.top && position[0] > p.left && position[0] < p.right) return p;
    }
  }
  
  return null;
};

PlatformManager.prototype.draw = function(display) {
  _.each(this.spatial_partition, function(bucket) {
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
