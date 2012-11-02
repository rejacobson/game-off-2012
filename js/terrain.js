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

PlatformManager.prototype.getBucketIndex = function(y) {
  return Math.floor(y / this.settings.bucket_size);
};

PlatformManager.prototype.platforms = function(bucket) {
  return this.spatial_partision[bucket];
};

PlatformManager.prototype.closestPlatform = function(position) {
  if (top > this.settings.height) return false;

  var bucket = Math.floor(top/this.settings.bucket_size);
  
  var platforms;

  if (platforms = this.platforms(bucket)) {
    for (var i = 0; i<platforms.length; i++) {
      if (platforms.top > top) return p;
    }
  }
};

PlatformManager.prototype.draw = function(display) {
  _.each(this.spatial_partition, function(bucket) {
    _.each(bucket, function(platform) {
      platform.draw(display);
    });
  });
};


var Platform = exports.Platform = function(left, right, top) {
  this.left = left;
  this.right = right;
  this.top = top;
};

Platform.prototype.draw = function(display) {
  gamejs.draw.line(display, '#ff0000', [this.left, this.top], [this.right, this.top], 1);
};
