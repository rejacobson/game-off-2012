var gamejs = require('gamejs');
var actions = require('actions');

gamejs.preload(['images/mob/toothface.png']);

exports.stats = {
  speed: 100
};

exports.settings = {
  position: [300, 450],
  hitbox: new gamejs.Rect([0, 0], [24, 15]),
  update: function(msDuration) { },
  collision: function(entity) {
console.log('Toothface collides with: '+ entity.name);
    // Player is moving faster than the entity
    if (this.velocity[0] != 0) { // && Math.abs(this.velocity[0]) > Math.abs(entity.velocity[0])) {

      // Player and entity are facing the same direction
      if (this.facing == entity.facing) {
        
        // Player is behind entity
        // entity.x - player.x * player.facing > 0 if the player is behind the entity
        // entity.x - player.x * player.facing < 0 if the player is in front of the entity
        if (entity.position[0] - this.position[0] * this.facing > 0) {
          var clip = this.hitbox.clip(entity.hitbox);
          entity.position[1] += 2; 
          entity.velocity[0] = entity.velocity[0] * 3;
          entity.platform = null;
        }
      } 
    }
  }
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

exports.collides_with = ['*'];

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
