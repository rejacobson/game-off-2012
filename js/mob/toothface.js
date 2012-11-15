var gamejs = require('gamejs');
var actions = require('actions');

gamejs.preload(['images/mob/toothface.png']);

exports.stats = {
  speed: 100
};

exports.settings = {
  position: [300, 450],
  hitbox: new gamejs.Rect([0, 0], [24, 15]),
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

exports.actions = actions.Actions;
 
exports.behaviour = {
  'patrol': {
    'test edge': ['is_near_edge', 'turn'],
    'walk': ['walk', 'move']
  }

  //'attack': ['has_target', 'is_target_in_attack_range', 'attack'],
  //'seek target': ['seek_target'],
  //'follow': ['has_target', 'face_target', 'is_far_from_target', 'move'],
  //'flee': ['has_target', 'face_away_from_target', 'move'],
  /*'patrol': {
    'turn': ['is_near_edge', 'turn'],
    'walk': ['move']
  }*/
};
