var gamejs = require('gamejs');
var vectors = gamejs.utils.vectors;
var event = gamejs.event;

var RIGHT = exports.RIGHT = 1;
var LEFT = exports.LEFT = -1;

var X = exports.X = 0;
var Y = exports.Y = 1;


var NextId = (function(){
  var id = 0;
  return function() {
    return ++id;
  };
})();

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
var Creature = exports.Creature = function(world, name, stats, settings) {
  Stats.call(this, stats);

  this.id = NextId(); 

  this.world = world;
 
  this.name = name; 

  this.velocity = [0, 0, 0];
  this.position = settings.position;

  this.platform = settings.platform;
  this.pole = settings.pole;

  this.facing = RIGHT;  // Facing positive direction; east
  this.on_ground = true;

  this.animation = settings.animation;
  this.hitbox = settings.hitbox || null;

  this.controller = settings.controller || null;
  this.update_callback = settings.update || null;

  this.actions = {};
};

Creature.prototype.update = function(msDuration) {
  this.animation.update(msDuration);

  this.position = vectors.add(this.position, vectors.multiply(this.velocity, msDuration));

  // Test the edges of the platform
  if (this.platform) {
    if (this.position[X] < this.platform.left || this.position[X] > this.platform.right) {
      this.platform = null;
      this.on_ground = false;
    }
  }

  // Test the edges of the pole
  if (this.pole) {
    if (this.hitbox.left > this.pole.left ||
        this.hitbox.right < this.pole.left ||
        this.hitbox.bottom < this.pole.top ||
        this.hitbox.top > this.pole.bottom) {
      this.pole = null;
    }
  }

  // Gravity
  if (!this.pole) this.velocity[Y] += 2000 * msDuration;

  // Terminal Velocity
  if (this.velocity[Y] > 500) this.velocity[Y] = 500;

  // Find a new platform to land on
  if (!this.platform && this.velocity[Y] > 0) {
    this.platform = this.world.platforms.findClosest(this.position); 
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

    if (this.velocity[X] == 0 && this.velocity[Y] == 0) {
      this.animation.state('idle'); 
    }
  }

  this.hitbox.left = this.position[0] - this.hitbox.width*0.5
  this.hitbox.bottom = this.position[1]; 

  if (this.update_callback) {
    this.update_callback.call(this, msDuration);
  }
};

Creature.prototype.draw = function(display) {
  this.animation.draw(display, this.position);
  if (this.platform) {
    gamejs.draw.line(display, '#00ff00', [this.platform.left, this.platform.top], [this.platform.right, this.platform.top], 2);
  }
  if (this.pole) {
    gamejs.draw.line(display, '#00ff00', [this.pole.left, this.pole.top], [this.pole.left, this.pole.bottom], 2);
  }
  gamejs.draw.rect(display, '#ffff00', this.hitbox, 1);
}

Creature.prototype.face = function(direction) {
  this.facing = parseInt(direction);
  this.animation.flip(this.facing);
}

