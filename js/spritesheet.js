var gamejs = require('gamejs');

var SpriteSheet = exports.SpriteSheet = function(imagePath, frameSize) {
    this.surfaceCache = [];

    if (_.isArray(imagePath)) {
      this.surfaceCache = imagePath;
      return;
    }

    var width = frameSize[0];
    var height = frameSize[1];
    var image = gamejs.image.load(imagePath);
    var imgSize = new gamejs.Rect([0,0], [width,height]);

    // extract the single images from big spritesheet image
    for (var j=0; j<image.rect.height; j+=height) {
      for (var i=0; i<image.rect.width; i+=width) {
        var surface = new gamejs.Surface([width, height]);
        var rect = new gamejs.Rect(i, j, width, height);
        surface.blit(image, imgSize, rect);
        this.surfaceCache.push(surface);
      }
    }
};

SpriteSheet.prototype.size = function() {
  return this.surfaceCache.length;
};

SpriteSheet.prototype.get = function(id) {
  return this.surfaceCache[id];
};

SpriteSheet.prototype.scale = function(x, y) {
  var newSurfaceCache = [];

  for (var i=0; i<this.surfaceCache.length; i++) {
    newSurfaceCache[i] = this.surfaceCache[i].scale(x, y);  
  } 

  return new SpriteSheet(newSurfaceCache);
};

gamejs.Surface.prototype.scale = function(x, y) {
  var newSurface = new gamejs.Surface(this.getRect());

  // Keep the image centered during the scale
  var translate_x = this.rect.width/2 - this.rect.width * x / 2;
  var translate_y = this.rect.height/2 - this.rect.height * y / 2;

  newSurface.context.save();
  newSurface.context.translate(translate_x, translate_y);
  newSurface.context.scale(x, y);
  newSurface.blit(this);
  newSurface.context.restore();
  return newSurface;
};

gamejs.Surface.prototype.flipHorizontal = function() {
  return this.scale(-1, 1);
};
gamejs.Surface.prototype.flipVertical = function() {
  return this.scale(1, -1);
};
