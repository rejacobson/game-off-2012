var gamejs = require('gamejs');
var tree_species = require('tree_species');
var srand = require('srand');
var util = require('util');
var vectors = gamejs.utils.vectors;
var spritesheet = require('spritesheet');

gamejs.preload(['images/leaves/summer.png']);
gamejs.preload(['images/leaves/autumn.png']);
gamejs.preload(['images/leaves/spring.png']);


var LEAF = new gamejs.Rect([0, 0], [6, 6]);

var Tree = exports.Tree = function(seed, trunk_settings, on_finished) {
  this.alive = true;
  this.name = trunk_settings.name || 'Unknown';
  this.branches = [];

  var last_branch;
  var size = 0;
  var i, len;

  _.extend(trunk_settings, {
    generation: 0
  });
    
  _.extend(this, {
    
    eachBranch: function(callback) {
      for (i=0, len=this.branches.length; i<len; ++i) {
        if (!this.branches[i].alive) continue;
        callback.call(this, this.branches[i]);
      }
    },

    getLastBranch: function() {
      return last_branch;
    },

    finished: function() {
      return size <= 0;
    },
  
    addBranch: function(branch) {
      if (branch.profile && branch.profile.onSprout) {
        // onSprout - callback
        if (false === branch.profile.onSprout.call(branch, branch.profile.direction, branch.profile.destination)) return false;
      }

      last_branch = branch;
      this.branches.push(branch);
      size++;
    },

    removeBranch: function(branch) {
      branch.alive = false;
      size--;
    },
  
    update: function(msDuration) {
      if (this.finished() || !this.alive) {
        this.alive = false;
        return false;
      }

      for (i=0, len=this.branches.length; i<len; ++i) {
        if (!this.branches[i].alive) continue;
        if (false === this.branches[i].update(msDuration)) {
          this.removeBranch(this.branches[i]);
        }
      }
 
      if (this.finished()) {
        if (on_finished && _.isFunction(on_finished)) on_finished.call(this);
      }
    },
    
    draw: function(background, foreground) {
      for (i=0, len=this.branches.length; i<len; ++i) {
        if (!this.branches[i].alive) continue;
        this.branches[i].draw(background, foreground);
      }
    }
  });

  this.addBranch(new Branch(this, seed, trunk_settings));
};


var Branch = function(tree, position, settings) {
  this.alive = true;
  this.tree = tree;
  this.position = position.slice(0);
  this.last_position = position.slice(0);

  if (typeof settings.leaf_spritesheet == 'string') {
    settings.leaf_spritesheet = new spritesheet.SpriteSheet(settings.leaf_spritesheet, [6, 6]);
  }

  this.profile = {
    leaf: null,

    leaf_stucture: null,
    leaf_spritesheet: null,
    leaf_spread: [15, 15],
    leaf_density: 3,

    destination: [0, 0],
    velocity: [0, 0],
    
    direction: [0, -1],
    trend: [0, 0],
    
    speed: 150,
    step: 50,
    momentum: 0,
    
    generation: 0,
    max_generations: 3,

    max_steps: 0,
    step_count: 0,
    
    turn_chance: 20,
    
    color: '#521300',

    sprouts: 0,
    sprout_delay: 0,

    bounds: [null, null, null, null], // left, top, right, bottom bounds

    transform: function(branch) {
      branch.profile.width = Math.max(Math.round(branch.profile.width * 0.5), 1);
      return branch;
    },

    onGrow: null,
    onSprout: null,
    onTurn: null,
    onStep: null
  };
  
  _.extend(this.profile, settings);

  this.setDirection(this, this.profile.direction);
};


Branch.prototype = {

  setDirection: function(branch, dir) {
    var p = branch.profile;
    p.direction = dir;
    p.destination = vectors.add(branch.position, vectors.multiply(p.direction, p.step));
    p.velocity = vectors.multiply(p.direction, p.speed);
  },

  inBounds: function(branch, position) {
    if (!branch) branch = this;
    if (!position) position = branch.position;

    return (branch.profile.bounds[0] == null || position[0] >= branch.profile.bounds[0]) &&
           (branch.profile.bounds[1] == null || position[1] >= branch.profile.bounds[1]) &&
           (branch.profile.bounds[2] == null || position[0] <= branch.profile.bounds[2]) &&
           (branch.profile.bounds[3] == null || position[1] <= branch.profile.bounds[3]);
  },

  sproutChance: function() {
    return Math.round(this.profile.sprouts / this.profile.step_count * 100);
  },

  hasArrivedAtDestination: function() {
    // Use dot product to determine what side of the destination the current position is on.
    // http://forums.anandtech.com/showthread.php?t=162930
    return vectors.dot(vectors.subtract(this.profile.destination, this.position), this.profile.direction) <= 0;
  },

  adjacentDirections: function() {
    return [vectors.leftNormal(this.profile.direction), vectors.rightNormal(this.profile.direction)];
  },

  clone: function() {
    var cloned_profile = _.clone(this.profile);
    
    _.extend(cloned_profile, {
      destination: this.profile.destination.slice(0),
      velocity: this.profile.velocity.slice(0),
      direction: this.profile.direction.slice(0),
      trend: this.profile.trend.slice(0),
    });
    
    return new Branch(this.tree, this.position, cloned_profile);
  },

  transform: function(branch_copy) {
    if (this.profile.transform && _.isFunction(this.profile.transform)) {
      branch_copy = this.profile.transform.call(this, branch_copy);
    }
    
    return branch_copy;
  },

  // Sprout a new branch
  sprout: function() {
    var choices = _.without(this.adjacentDirections(), this.profile.direction),
        index = srand.random.range(0, choices.length - 1),
        dir = choices[index],
        cloned_branch = this.clone();

    _.extend(cloned_branch.profile, {
      step_count: 0,
      generation: this.profile.generation + 1  
    });

    this.setDirection(cloned_branch, dir); 

    if (!this.inBounds(cloned_branch, cloned_branch.profile.destination)) return false;

    cloned_branch = this.transform(cloned_branch); 
    
    this.tree.addBranch(cloned_branch);

    this.profile.sprouts--;

    return cloned_branch;
  },

  // Turn left or right
  turn: function() {
    var anti_trend = vectors.multiply(this.profile.trend, -1),
        directions = _.reject(this.adjacentDirections(), function(i) { return i[0] == anti_trend[0] && i[1] == anti_trend[1]; });
        index = srand.random.range(0, directions.length-1),
        dir = directions[index],
        new_dest = vectors.add(this.profile.destination, vectors.multiply(dir, this.profile.step));

    // onTurn - callback
    if (this.profile.onTurn && false === this.profile.onTurn.call(this, dir, new_dest)) return false;

    if (!this.inBounds(this, new_dest)) {
      dir = this.profile.direction;
    } else {
      if (dir[0] == 0 && dir[1] < 0) this.last_position[1] = this.position[1] + this.profile.width - 1;
    }

    this.setDirection(this, dir); 
  },

  // Turn or Sprout
  arrive: function() {
    if (!this.inBounds() && this.profile.momentum <= 0) this.profile.step_count = this.profile.max_steps;

    if (this.profile.momentum > 0) this.profile.momentum--;
    if (this.profile.sprout_delay > 0) this.profile.sprout_delay--;

    // onStep - callback
    if (this.profile.onStep) this.profile.onStep.call(this);

    if (this.profile.step_count < this.profile.max_steps) {
      this.profile.step_count++;
      this.behave();
    }
  },

  // Turn or Sprout
  behave: function() {
    var self = this, direction = this.profile.direction, sprout;

    if (this.profile.momentum <= 0 && srand.random.range(0, 100) > this.profile.turn_chance) {
      this.turn();
    } else {
      // Go straight
      this.profile.destination = vectors.add(this.profile.destination, vectors.multiply(this.profile.direction, this.profile.step));
    }
    
    if (this.profile.sprout_delay <= 0 && this.profile.generation < this.profile.max_generations && this.profile.sprouts > 0 && srand.random.range(100) < this.sproutChance()) {
      sprout = this.sprout();
    }

    if (this.profile.leaf && this.profile.width == 1 && srand.random.range(100) > 70) {
      var directions = this.adjacentDirections().concat(direction);
  
      directions = _.reject(directions, function(i) { return i[0] == self.profile.direction[0] && i[1] == self.profile.direction[1]; });

      if (sprout) {
        directions = _.reject(directions, function(i) { return i[0] == sprout.profile.direction[0] && i[1] == sprout.profile.direction[1]; });
      }

      var dir = directions[srand.random.range(directions.length - 1)];

      var bush = tree_species[this.profile.leaf.structure](this.position, {
        leaf_spritesheet: this.profile.leaf.spritesheet,
        leaf_spread: this.profile.leaf.spread,
        leaf_density: this.profile.leaf.density,
        direction: dir
      });

      this.tree.addBranch(bush);  
    } 
  },

  // Update this branch
  update: function(msDuration) {
    if (this.profile.step_count >= this.profile.max_steps || isNaN(this.position[0]) || isNaN(this.position[1])) {
      return false;
    }

    this.last_position = this.position.slice(0);

    if (this.delayed_callback) {
      this.delayed_callback.call(this);
      this.delayed_callback = null;
    }

    this.position = vectors.add(this.position, vectors.multiply(this.profile.velocity, msDuration));

    // onGrow - callback
    if (this.profile.onGrow) this.profile.onGrow.call(this, msDuration);

    if (this.hasArrivedAtDestination()) {
      this.position = this.profile.destination.slice(0);
      this.delayed_callback = this.arrive;
    }
  },

  // Draw the branch
  draw: function(background, foreground) {
    // Moving vertically
    if (this.profile.direction[0] == 0) {
      gamejs.draw.line(background, this.profile.color, this.position, this.last_position, this.profile.width);

    // Moving horizontally
    } else {
      var w = this.profile.width,
          dy = this.profile.width;

      if (w %2 == 0) w += 1;
      dy = Math.floor(w * 0.5);

      gamejs.draw.line(background, this.profile.color, [this.position[0], this.position[1] + dy], [this.last_position[0], this.last_position[1] + dy], w);
    }

    if (this.profile.width == 1 && this.profile.leaf_spritesheet) {
      var size = this.profile.leaf_spritesheet.size(),
          num = srand.random.range(this.profile.leaf_density || 2), 
          index = srand.random.range(size - 1),
          leaf = this.profile.leaf_spritesheet.get(index),
          spread = this.profile.leaf_spread || [10, 10],
          dx, dy, x, y;

      for (var i=0; i<num; ++i) {
        dx = srand.random.range(-spread[0], spread[0]);
        dy = srand.random.range(-spread[1], spread[1]);
        x = Math.floor((this.position[0] + dx) / this.profile.step) * this.profile.step;
        y = Math.floor((this.position[1] + dy) / this.profile.step) * this.profile.step;
        LEAF.topleft = [x, y];
        foreground.blit(leaf, LEAF);
      } 
    }

  } 

}; // End prototype
