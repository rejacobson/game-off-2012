var gamejs = require('gamejs');
var actions = require('actions');

gamejs.preload(['images/mob/bunny.png']);

exports.stats = {
  speed: 100
};

exports.settings = function() {
  return {
    position: [300, 450],
    hitbox: new gamejs.Rect([0, 0], [30, 30]),
    collision: function(entity) {
      if (entity.state == 'running') {
        this.pushedOff(entity);  
      }
    }
  };

};

exports.animation =  {
  spritesheet: {
    image: 'images/mob/bunny.png',
    framesize: [30, 30]
  },
  cycles: {
    idle: [0, 0]
  },
  fps: 16 
};

exports.collides_with = ['hero'];

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

