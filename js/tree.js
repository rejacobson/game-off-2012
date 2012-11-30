var gamejs = require('gamejs');
var srand = require('srand');
var util = require('util');
var vectors = gamejs.utils.vectors;
var spritesheet = require('spritesheet');

gamejs.preload(['images/leaves/summer.png']);


var Oak = exports.Oak = function(seed, settings) {
  var defaults = {
    width: 25,
    max_steps: 15,
    direction: [0, -1],
    trend: [0, -1],
    momentum: 8,
    sprouts: 6,
    bounds: [null, 100, null, seed[1] - 100], // left, top, right, bottom
    transform: function(branch) {
      _.extend(branch.profile, {
        max_steps: 15,
        width: Math.max(Math.round(branch.profile.width * 0.2), 1),
        momentum: 3,
        sprouts: 2,
        trend: branch.profile.direction
      }); 

      return branch;
    }
  };

  settings = _.extend(defaults, settings);

  return new Tree(seed, settings);
}

var Pine = exports.Pine = function(seed, settings) {
  var defaults = {
    width: 20,
    max_steps: 30,
    direction: [0, -1],
    trend: [0, -1],
    momentum: 12,
    sprouts: 10,
    bounds: [null, 100, null, seed[1] - 200], // left, top, right, bottom
    transform: function(branch) {
      _.extend(branch.profile, {
        max_steps: 5,
        width: Math.max(Math.round(branch.profile.width * 0.5), 1),
        momentum: 5,
        sprouts: 2,
        trend: branch.profile.direction
      }); 

      return branch;
    }
  };

  settings = _.extend(defaults, settings);

  return new Tree(seed, settings);
};

var Willow = exports.Willow = function(seed, settings) {
  var defaults = {
    width: 15,
    max_steps: 15,
    direction: [0, -1],
    trend: [0, -1],
    momentum: 3,
    sprouts: 7,
    bounds: [null, 100, null, seed[1] - 50], // left, top, right, bottom
    transform: function(branch) {
      var sideways = branch.profile.direction[1] == 0;

      _.extend(branch.profile, {
        max_generations: 5,
        max_steps: sideways ? 25 : 2,
        width: branch.profile.generation == 1 ? 4 : Math.max(Math.round(branch.profile.width * 0.75), 1),
        momentum: sideways ? 8 : 0,
        sprouts: sideways ? 4 : 1,
        trend: branch.profile.direction
      }); 

      return branch;
    }
  };

  settings = _.extend(defaults, settings);

  return new Tree(seed, settings);
};

var Down = exports.Down = function(seed, settings) {
  var defaults = {
    width: 20,
    max_steps: 25,
    direction: [0, -1],
    trend: [0, 1],
    momentum: 1,
    sprouts: 6,
    sprout_delay: 8,
    bounds: [null, 100, null, null], // left, top, right, bottom
    transform: function(branch) {
      _.extend(branch.profile, {
        max_steps: 15,
        width: Math.max(Math.round(branch.profile.width * 0.5), 1),
        momentum: 2,
        sprouts: 2,
        sprout_delay: 0,
        trend: branch.profile.direction
      }); 

      return branch;
    }
  };

  settings = _.extend(defaults, settings);

  return new Tree(seed, settings);
}


var Bonzai = exports.Bonzai = function(seed, settings) {
  var defaults = {
    width: 1,
    step: 10,
    max_steps: 10,
    direction: [0, -1],
    trend: [0, -1],
    momentum: 4,
    sprouts: 4,
    bounds: [null, 100, null, seed[1] - 10], // left, top, right, bottom
    transform: function(branch) {
      _.extend(branch.profile, {
        max_steps: Math.ceil(branch.profile.max_steps * 0.75),
        width: 1,
        momentum: 3,
        sprouts: 2,
        trend: branch.profile.direction
      }); 

      return branch;
    }
  };

  settings = _.extend(defaults, settings);

  return new Tree(seed, settings);
}

var Shrub = exports.Shrub = function(seed, settings) {
  var defaults = {
    max_generations: 2,
    width: 1,
    step: 10,
    max_steps: 2,
    direction: [0, -1],
    trend: [0, -1],
    momentum: 1,
    sprouts: 1,
    bounds: [null, null, null, null], // left, top, right, bottom
    transform: function(branch) {
      _.extend(branch.profile, {
        max_steps: Math.ceil(branch.profile.max_steps * 0.75),
        width: 1,
        momentum: 0,
        sprouts: 1,
        trend: branch.profile.direction
      }); 

      return branch;
    }
  };

  settings = _.extend(defaults, settings);

  return new Tree(seed, settings);
}

var Tree = exports.Tree = function(seed, trunk_settings, on_finished) {
  this.alive = true;

  var branches = [];
  var last_branch;
  var size = 0;
  var i, len;

  _.extend(trunk_settings, {
    generation: 0
  });
    
  _.extend(this, {
    
    eachBranch: function(callback) {
      for (i=0, len=branches.length; i<len; ++i) {
        if (!branches[i].alive) continue;
        callback.call(this, branches[i]);
      }
    },

    branches: function() {
      var b = [];
      for (i=0, len=branches.length; i<len; ++i) {
        if (!branches[i] || !branches[i].alive) continue;
        b.push(branches[i]);
      }
      return b;
    },

    getLastBranch: function() {
      return last_branch;
    },

    finished: function() {
      return size <= 0;
    },
  
    addBranch: function(branch) {
      last_branch = branch;
      branches.push(branch);
      size++;
    },

    removeBranch: function(branch) {
      branch.alive = false;
      size--;
    },
  
    update: function(msDuration) {
      if (this.finished()) return false;

      for (i=0, len=branches.length; i<len; ++i) {
        if (!branches[i].alive) continue;
        if (false === branches[i].update(msDuration)) this.removeBranch(branches[i]);
      }
 
      if (this.finished()) {
        if (on_finished && _.isFunction(on_finished)) on_finished.call(this);
      }
    },
    
    draw: function(background, foreground) {
      for (i=0, len=branches.length; i<len; ++i) {
        if (!branches[i].alive) continue;
        branches[i].draw(background, foreground);
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

  if (typeof settings.leaves == 'string') {
    settings.leaves = new spritesheet.SpriteSheet(settings.leaves, [6, 6]);
  }

  this.profile = {
    leaves: null,

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
    
    // onSprout - callback
    if (this.profile.onSprout && false === this.profile.onSprout.call(this, cloned_branch)) return false;

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

    if (this.profile.width == 1 && srand.random.range(100) > 70) {
      var directions = this.adjacentDirections().concat(direction);
  
      directions = _.reject(directions, function(i) { return i[0] == self.profile.direction[0] && i[1] == self.profile.direction[1]; });

      if (sprout) {
        directions = _.reject(directions, function(i) { return i[0] == sprout.profile.direction[0] && i[1] == sprout.profile.direction[1]; });
      }

      var dir = directions[srand.random.range(directions.length - 1)];

      var bush = new Shrub(this.position, {
        leaves: 'images/leaves/summer.png',
        direction: dir
      });
      this.tree.addBranch(bush);  
    } 
  },

  // Update this branch
  update: function(msDuration) {
    if (this.profile.step_count >= this.profile.max_steps) return false;

    this.last_position = this.position.slice(0);

    if (this.delayed_callback) {
      this.delayed_callback.call(this);
      this.delayed_callback = null;
    }

    this.position = vectors.add(this.position, vectors.multiply(this.profile.velocity, msDuration));

    if (this.hasArrivedAtDestination()) {
      this.position = this.profile.destination.slice(0);
      this.position = this.position;

      this.delayed_callback = this.arrive;
    }

    // onGrow - callback
    if (this.profile.onGrow) this.profile.onGrow.call(this, msDuration);
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

/*
    if (this.profile.width == 1 && this.profile.leaves) {
      var size = this.profile.leaves.size(),
          num = srand.random.range(1), 
          index = srand.random.range(num),
          leaf = this.profile.leaves.get(index),
          rect = new gamejs.Rect([0, 0], [6, 6]),
          dx, dy;

      for (var i=0; i<num; ++i) {
        dx = srand.random.range(-30, 30);
        dy = srand.random.range(-30, 30);
        rect.topleft = [this.position[0] + dx, this.position[1] + dy];
        background.blit(leaf, rect);
      } 
    }
*/

  } 

}; // End prototype
