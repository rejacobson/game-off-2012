var gamejs = require('gamejs');
var srand = require('srand');
var actions = require('actions');

gamejs.preload(['images/mob/bunny.png']);

exports.stats = {
  speed: 60
};

exports.settings = function() {
  return {
    position: [300, 450],
    hitbox: new gamejs.Rect([0, 0], [24, 18]),
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

var hop_height;
_.extend(exports.actions, {
  hop: function() {
    if (!this.on_ground) return;

    this.animation.state('walk');

    hop_height = srand.random.range(100, 300);
    if (hop_height == 200) hop_height = srand.random.range(500, 600);

    this.velocity[0] = this.stats.speed * srand.random.range(1, 3) * this.facing;
    this.velocity[1] = -hop_height;
    this.on_ground = false;
    this.platform = null;
  }  
});
 
exports.behaviour = {
  'patrol': {
    'test edge': ['is_near_edge 50', 'turn'],
    'hop': ['hop']
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

