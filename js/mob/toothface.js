var gamejs = require('gamejs');
var event = gamejs.event;
var entity = require('entity');
var animation = require('animation');

exports.create = function(world) {
  return new entity.Creature(world, 'Toothface', {
    stats: {
      speed: 100
    },
    animation: animation.Animation.factory(animation_specs),
    position: [400, 450]
  });
};

var animation_specs = exports.animation_specs = {
  spritesheet: {
    image: 'images/mob/toothface.png',
    framesize: [48, 24]
  },
  cycles: {
    idle: [0, 0]
  },
  fps: 16 
};

gamejs.preload(['images/mob/toothface.png']);

