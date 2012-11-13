var gamejs = require('gamejs');
var event = gamejs.event;
var entity = require('entity');

gamejs.preload(['images/mob/hero.png']);

exports.stats = {
  speed: 100
};

exports.settings = {
  position: [100, 450],
  update: function(msDuration) { }
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


var action_map = {};
action_map[event.K_w+'_hold'] = ['move_up'];
action_map[event.K_s+'_hold'] = ['move_down'];
action_map[event.K_a+'_hold'] = ['turn -1', 'walk', 'move'];
action_map[event.K_d+'_hold'] = ['turn 1', 'walk', 'move'];
action_map[event.K_a+'_dbl_hold'] = ['turn -1', 'run', 'move'];
action_map[event.K_d+'_dbl_hold'] = ['turn 1', 'run', 'move'];
action_map[event.K_SPACE] = ['jump'];

exports.keys = action_map;

exports.actions = {
  turn: function(msDuration, direction) {
    if (!direction) {
      this.face(this.facing * -1);
    } else {
      this.face(direction);   
    }
    
    return true;
  },

  walk: function(msDuration) {
    if (this.on_ground) {
      this.animation.state('walk');
      this.stats.speed = this.base_stats.speed;
    }
  }, 

  run: function(msDuration) {
    if (this.on_ground) {
      this.animation.state('walk');
      this.stats.speed = this.base_stats.speed * 3;
    }

  }, 

  move: function(msDuration) {
    if (this.pole) this.position[0] += 50 * msDuration * this.facing;

    if (this.on_ground) {
      this.velocity[entity.X] = this.stats.speed * this.facing;
    } else {
      this.position[entity.X] += 1 * this.facing;
    }
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
    } else if (this.on_ground && this.platform && this.platform.settings.is_ground == false) {
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
