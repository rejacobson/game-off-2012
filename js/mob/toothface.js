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

exports.behaviour = {
  'walk': ['is_far_from_edge', 'walk']

  //'attack': ['has_target', 'is_target_in_attack_range', 'attack'],
  //'seek target': ['seek_target'],
  //'follow': ['has_target', 'face_target', 'is_far_from_target', 'move'],
  //'flee': ['has_target', 'face_away_from_target', 'move'],
  /*'patrol': {
    'turn': ['is_near_edge', 'turn'],
    'walk': ['move']
  }*/
}
