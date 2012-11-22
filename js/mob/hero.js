var gamejs = require('gamejs');
var event = gamejs.event;
var entity = require('entity');
var collision = require('collision');


gamejs.preload(['images/mob/hero.png']);

exports.stats = {
  speed: 100
};

exports.settings = {
  position: [100, 450],
  hitbox: new gamejs.Rect([0, 0], [12, 20]),
  update: function(msDuration) { },
  collision: function(entity) {
    // Player is moving faster than the entity
    if (this.velocity[0] != 0) { // && Math.abs(this.velocity[0]) > Math.abs(entity.velocity[0])) {

      // Player and entity are facing the same direction
      if (this.facing == entity.facing) {
        
        // Player is behind entity
        // entity.x - player.x * player.facing > 0 if the player is behind the entity
        // entity.x - player.x * player.facing < 0 if the player is in front of the entity
        if (entity.position[0] - this.position[0] * this.facing > 0) {
          var clip = this.hitbox.clip(entity.hitbox);
          
          if (this.state == 'walking') {
            entity.position[0] += clip.width * this.facing;
          } else if (this.state == 'running') {
            entity.position[1] += 2; 
            entity.velocity[0] = entity.velocity[0] * 3;
            entity.platform = null;
          }
        }
      } 
    }
  }
};

exports.animation =  {
  spritesheet: {
    image: 'images/mob/hero.png',
    framesize: [48, 24]
  },
  cycles: {
    idle: [0, 6],
    walk: [7, 11]
  },
  fps: 16 
};

exports.collides_with = ['*'];


var action_map = {};
// Climbing
action_map[event.K_w+'_hold'] = ['move_up'];
action_map[event.K_s+'_hold'] = ['move_down'];

// Walking
action_map[event.K_a+'_hold'] = ['turn -1', 'walk', 'move'];
action_map[event.K_d+'_hold'] = ['turn 1', 'walk', 'move'];

// Running
action_map[event.K_a+'_dbl'] = ['turn -1', 'run'];
action_map[event.K_d+'_dbl'] = ['turn 1', 'run'];

// Continue running
action_map[event.K_a+'_dbl_hold'] = ['move'];
action_map[event.K_d+'_dbl_hold'] = ['move'];

// Jump
action_map[event.K_SPACE] = ['jump'];

exports.keys = action_map;

exports.actions = {
  turn: function(msDuration, direction) {
    if (this.platform && !this.on_ground) return false;

    if (!direction) {
      this.face(this.facing * -1);
    } else {
      this.face(direction);   
    }
    
    return true;
  },

  walk: function(msDuration) {
    if (!this.on_ground) return false;

    this.animation.state('walk');
    this.stats.speed = this.base_stats.speed;
    this.state = 'walking';

    return true;
  }, 

  run: function(msDuration) {
    if (!this.on_ground) return false;

    this.animation.state('walk');
    this.stats.speed = this.base_stats.speed * 3;
    this.state = 'running';

    return true;
  }, 

  move: function(msDuration) {
    if (this.pole) this.position[0] += 50 * msDuration * this.facing;

    if (this.on_ground) {
      this.velocity[entity.X] = this.stats.speed * this.facing;
    } else {
      this.position[entity.X] += 1 * this.facing;
    }

    return true;
  }, 

  move_up: function(msDuration){
    if (this.pole) {
      this.position[1] -= 75 * msDuration;
    } else {    
      this.pole = this.world.poles.findClosest(this.hitbox); 
      if (this.pole) {
        this.platform = null;
        this.velocity = [0, 0];
        this.on_ground = false;
      }
    }
  },
  
  move_down: function(msDuration){
    if (this.pole) {
      this.position[1] += 90 * msDuration;
    } else if (this.on_ground && this.platform && this.platform.settings.fall_through == true) {
      this.position[entity.Y] += 1;
      this.on_ground = false;
      this.platform = null;
    }
  },

  jump: function(msDuration){
    if (this.pole) {
      this.pole = null;
      this.velocity = [250 * this.facing, -200];
    }

    if (this.on_ground && this.platform) {
      this.platform = null;
      this.on_ground = false;
      this.velocity[entity.Y] = -450;
      //player.animation('jumping');
    }
  },
  
  idle: function(msDuration) {
    //player.animation('idle');
  }
}
