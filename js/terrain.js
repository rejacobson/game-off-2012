var gamejs = require('gamejs');

var PlatformManager = exports.PlatformManager = function(settings) {
  var default = {
    height: 500,
    buckets: 20
  };
  this.settings = _.extend(defaults, settings); 
  this.settings.bucket_size = this.settings.height / this.settings.buckets;

  var spatial_partition = []; 

};

PlatformManager.prototype.addPlatform = function(platform) {
  var bucket = Math.floor(platform.top / this.settings.bucket_size);
  if (!this.spatial_partition[bucket]) this.spatial_partition[bucket] = [];

  this.spatial_partition[bucket].push(platform);

  if (this.spatial_partition[bucket].length > 1) {
    this.spatial_partition[bucket].sort(function(a, b) { return a - b; });
  } 

  return platform;
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


var Platform = exports.Platform = function(left, right, top) {
  this.left = left;
  this.right = right;
  this.top = top;
};
