var gamejs = require('gamejs');
var vectors = gamejs.utils.vectors;
var spritesheet = require('spritesheet');


var Image = exports.Image = function(img) {
  this.image = gamejs.image.load(img);
  this.rect = new gamejs.Rect([0, 0], this.image.getSize());
  this.offset = [-this.rect.width/2, -this.rect.height];
};
Image.prototype.draw = function(display, position) {
  this.rect.topleft = vectors.add(position, this.offset);
  display.blit(this.image, this.rect);
};
Image.prototype.state = function(name) { return name || null; };


var Animation = exports.Animation = function(spriteSheet, animationSpec, fps) {
  this.fps = fps || 6;
  this.frameDuration = 1000 / this.fps;
  this.spec = animationSpec;

  this.currentFrame = null;
  this.currentFrameDuration = 0;
  this.currentCycle = null;

  this.spriteSheets = {
     '1': spriteSheet,
    '-1': spriteSheet.scale(-1, 1)
  };
  this.currentSpriteSheet = this.spriteSheets[1];

  this.loopFinished = false;

  this.image = null;
  this.rect = new gamejs.Rect([0, 0]);
  this.offset = [0, 0];
}

Animation.prototype.state = function(cycle) {
  if (cycle && this.currentCycle != cycle) this.start(cycle);
  return this.currentCycle;
};

Animation.prototype.start = function(cycle) {
  this.currentCycle = cycle;
  this.currentFrame = this.spec[cycle][0];
  this.currentFrameDuration = 0;
  this.image = this.currentSpriteSheet.get(this.currentFrame);
  this.rect.width = this.image.getSize()[0];
  this.rect.height = this.image.getSize()[1];
  this.offset = [-this.rect.width/2, -this.rect.height];
};

Animation.prototype.update = function(msDuration) {
   msDuration *= 1000;

   if (!this.currentCycle) {
      throw new Error('No animation started. call start("fooCycle") before updating');
   }

   this.currentFrameDuration += msDuration;
   if (this.currentFrameDuration >= this.frameDuration) {
      this.currentFrame++;
      this.currentFrameDuration = 0;

      // loop back to first frame if animation finished or single frame
      var aniSpec = this.spec[this.currentCycle];
      if (aniSpec.length == 1 || this.currentFrame > aniSpec[1]) {
         this.loopFinished = true;
         // unless third argument is false, which means: do not loop
         if (aniSpec.length === 3 && aniSpec[2] === false) {
            this.currentFrame--;
         } else {
            this.currentFrame = aniSpec[0];
         }
      }

      this.image = this.currentSpriteSheet.get(this.currentFrame);
   }
};

Animation.prototype.draw = function(display, position) {
  this.rect.topleft = vectors.add(position, this.offset);
  display.blit(this.image, this.rect);
};

Animation.factory = function(spec) {
  var sheet = new spritesheet.SpriteSheet(spec.spritesheet.image, spec.spritesheet.framesize);
  var first_cycle = _.first(_.keys(spec.cycles)); 
  var animation = new Animation(sheet, spec.cycles, spec.fps);
  animation.start(first_cycle);

  return animation;
};

var animations = exports.animations = {
/*
  player: {
    spritesheet: {
      image: 'animations/player.png',
      framesize: [96, 48]
    },
    cycles: {
      idle: [0, 6],
      walk: [7, 11]
    },
    fps: 16 
  }
*/
};

var preload_list = [];
_.each(animations, function(e) {
  preload_list.push(e.spritesheet.image);
});
gamejs.preload(preload_list);
