var gamejs = require('gamejs');
var event = gamejs.event;
var entity = require('entity');
var animation = require('animation');

exports.create = function(world) {
  return new entity.Creature(world, 'Hero', {
    stats: {
      speed: 100
    },
    animation: animation.Animation.factory(animation_specs),
    position: [100, 450],
    update: function(msDuration) { }
  });
};

var animation_specs = exports.animation_specs = {
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

gamejs.preload(['images/mob/hero.png']);


var action_map = {};
action_map[event.K_w+'_hold'] = ['move_up'];
action_map[event.K_s+'_hold'] = ['move_down'];
action_map[event.K_a+'_hold'] = ['walk', 'move_left'];
action_map[event.K_d+'_hold'] = ['walk', 'move_right'];
action_map[event.K_a+'_dbl_hold'] = ['run', 'move_left'];
action_map[event.K_d+'_dbl_hold'] = ['run', 'move_right'];
action_map[event.K_SPACE] = ['jump'];

exports.ActionMap = action_map;

exports.Actions = {
  walk_action: function(msDuration) {
    this.stats.speed = this.base_stats.speed;
    this.animation.state('walk');
  },

  run_action: function(msDuration) {
    this.stats.speed = this.base_stats.speed * 3;
    this.animation.state('walk');
  },

  move_up_action: function(msDuration){
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
  
  move_down_action: function(msDuration){
    if (this.pole) {
      this.position[1] += 90 * msDuration;
    } else if (this.on_ground && this.platform && this.platform.settings.is_ground == false) {
      this.position[entity.Y] += 1;
      this.on_ground = false;
      this.platform = null;
    }
  },
  
  move_left_action: function(msDuration){
    if (this.pole) this.position[0] -= 50 * msDuration;
    if (!this.on_ground) return this.face(entity.LEFT);

    if (this.velocity[entity.X] <= 0) {
      this.face(entity.LEFT);
      this.velocity[entity.X] = -this.stats.speed;
    }
  },
  
  move_right_action: function(msDuration){
    if (this.pole) this.position[0] += 50 * msDuration;
    if (!this.on_ground) return this.face(entity.RIGHT);

    if (this.velocity[entity.X] >= 0) {
      this.face(entity.RIGHT);
      this.velocity[entity.X] = this.stats.speed;
    }
  },

  jump_action: function(msDuration, key_states){
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
  
  idle_action: function(msDuration) {
    //player.animation('idle');
  }
}
