var gamejs = require('gamejs');
var vectors = gamejs.utils.vectors;
var event = gamejs.event;

var RIGHT = exports.RIGHT = 1;
var LEFT = exports.LEFT = -1;

var X = exports.X = 0;
var Y = exports.Y = 1;


//////////////////////////////////////////////////////////
// Stats
//////////////////////////////////////////////////////////
var Stats = exports.Stats = function(stats) {
  var _stats = ['speed'];
  var assigns = {};
 
  _.each(_stats, function(stat) {
    assigns[stat] = stats[stat] || null;
  });

  this.base_stats = assigns;
  this.stats = _.clone(assigns);
}

//////////////////////////////////////////////////////////
// Creature
//////////////////////////////////////////////////////////
var Creature = exports.Creature = function(name, settings) {
  Stats.call(this, settings['stats']);
 
  this.name = name; 

  this.velocity = [0, 0, 0];
  this.position = settings.position;
  this.platform = settings.platform;

  this.facing = RIGHT;  // Facing positive direction; east
  this.on_ground = true;

  this.avatar = settings.avatar;

  this.update_callback = settings.update || null;
};

Creature.prototype.update = function(msDuration, terrain) {
  if (this.avatar.update) this.avatar.update(msDuration);

  this.position = vectors.add(this.position, vectors.multiply(this.velocity, msDuration));

  // Test the edges of the platform
  if (this.platform) {
    if (this.position[X] < this.platform.left || this.position[X] > this.platform.right) {
      this.platform = null;
      this.on_ground = false;
    }
  }

  // Gravity
  this.velocity[Y] += 2000 * msDuration;

  // Find a new platform to land on
  if (!this.platform && this.velocity[Y] > 0) {
    this.platform = terrain.closestPlatform(this.position); 
  }

  // Don't fall through the ground
  if (this.platform && this.position[Y] >= this.platform.top ) {
    this.on_ground = true;
    this.position[Y] = this.platform.top;
    this.velocity[Y] = 0;
  }

  // Friction
  if (this.on_ground) {
    if (this.velocity[X] != 0 ) {
      this.velocity[X] -= (this.velocity[X]*8 * msDuration);

      if (Math.abs(this.velocity[X]) < 10) {
        this.velocity[X] = 0;
      }
    }

/*
    if (this.velocity[X] == 0 && this.velocity[Y] == 0 && this.avatar.state() != 'idle') {
      this.avatar.state('idle'); 
    }
*/
  }

  if (this.update_callback) {
    this.update_callback.call(this, msDuration);
  }
};

Creature.prototype.draw = function(display) {
  if (this.avatar.draw) this.avatar.draw(display, this.position);
  if (this.platform) {
    gamejs.draw.line(display, '#00ff00', [this.platform.left, this.platform.top], [this.platform.right, this.platform.top], 2);
  }
}

Creature.prototype.face = function(direction) {
  this.facing = direction;
}

var basic_map = {};
basic_map[event.K_w+'_hold'] = ['move_up'];
basic_map[event.K_s+'_hold'] = ['move_down'];
basic_map[event.K_a+'_hold'] = ['walk', 'move_left'];
basic_map[event.K_d+'_hold'] = ['walk', 'move_right'];
basic_map[event.K_a+'_dbl_hold'] = ['run', 'move_left'];
basic_map[event.K_d+'_dbl_hold'] = ['run', 'move_right'];
basic_map[event.K_SPACE] = ['jump'];
exports.basic_action_map = basic_map;

exports.BasicActions = {
  walk_action: function(msDuration) {
    this.stats.speed = this.base_stats.speed;
    this.avatar.state('walk');
  },

  run_action: function(msDuration) {
    this.stats.speed = this.base_stats.speed * 3;
    this.avatar.state('walk');
  },

  move_up_action: function(msDuration){
  },
  
  move_down_action: function(msDuration){
    if (this.on_ground && this.platform && this.platform.settings.is_ground == false) {
      this.position[Y] += 1;
      this.on_ground = false;
      this.platform = null;
    }
  },
  
  move_left_action: function(msDuration){
    if (!this.on_ground) return this.face(LEFT);

    if (this.velocity[X] <= 0) {
      this.face(LEFT);
      this.velocity[X] = -this.stats.speed;
    }
  },
  
  move_right_action: function(msDuration){
    if (!this.on_ground) return this.face(RIGHT);

    if (this.velocity[X] >= 0) {
      this.face(RIGHT);
      this.velocity[X] = this.stats.speed;
    }
  },

  jump_action: function(msDuration, key_states){
    if (this.on_ground && this.platform) {
      this.platform = null;
      this.on_ground = false;
      this.velocity[Y] = -450;
      //player.animation('jumping');
    }
  },
  
  idle_action: function(msDuration) {
    //player.animation('idle');
  }
}
