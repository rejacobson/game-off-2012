var gamejs = require('gamejs');

gamejs.preload(['images/mob/toothface.png']);

exports.stats = {
  speed: 100
};

exports.settings = {
  position: [100, 450],
  update: function(msDuration) { }
};

exports.animation =  {
  spritesheet: {
    image: 'images/mob/toothface.png',
    framesize: [48, 24]
  },
  cycles: {
    idle: [0, 0]
  },
  fps: 16 
};
