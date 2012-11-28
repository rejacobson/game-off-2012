var gamejs = require('gamejs');
var srand = require('srand');
var util = require('util');
var vectors = gamejs.utils.vectors;


var Oak = exports.Oak = function(seed, settings) {
  var defaults = {
    width: 25,
    max_steps: 15,
    direction: [0, -1],
    trend: [0, -1],
    momentum: 8,
    sprouts: 6,
    bounds: [null, 100, null, seed[1] - 100], // left, top, right, bottom
    transform: function(opts) {
      return _.extend(opts, {
        max_steps: 15,
        width: Math.max(Math.round(opts.width * 0.5), 1),
        momentum: 3,
        sprouts: 2,
        trend: opts.direction
      }); 
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
    transform: function(opts) {
      return _.extend(opts, {
        max_steps: 5,
        width: Math.max(Math.round(opts.width * 0.5), 1),
        momentum: 5,
        sprouts: 2,
        trend: opts.direction
      }); 
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
    transform: function(opts) {
      var sideways = opts.direction[1] == 0;

      return _.extend(opts, {
        max_generations: 5,
        max_steps: sideways ? 25 : 2,
        width: opts.generation == 1 ? 4 : Math.max(Math.round(opts.width * 0.75), 1),
        momentum: sideways ? 8 : 0,
        sprouts: sideways ? 4 : 1,
        trend: opts.direction
      }); 
    }
  };

  settings = _.extend(defaults, settings);

  return new Tree(seed, settings);
};



var Tree = exports.Tree = function(seed, trunk_settings, on_finished) {
  var branches = [];
  var size = 0;
  var i, len;

  _.extend(trunk_settings, {
    generation: 0,
    position: seed.slice(0)
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

    finished: function() {
      return size <= 0;
    },
  
    addBranch: function(branch) {
      branches.push(branch);
      size++;
    },

    removeBranch: function(branch) {
      branch.alive = false;
      size--;
    },
  
    update: function(msDuration) {
      if (this.finished()) return false;

      this.eachBranch(function(branch) {
        if (false === branch.update(msDuration)) this.removeBranch(branch);
      });

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

  this.addBranch(new Branch(this, trunk_settings));
};


var Branch = function(tree, settings) {
  this.alive = true;

  var profile = {
    position: [0, 0],
    last_position: [0, 0],
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

    bounds: [null, null, null, null], // left, top, right, bottom bounds

    transform: function(opts) {
      opts.width = Math.max(Math.round(opts.width * 0.5), 1);
      return opts;
    },

    onGrow: null,
    onSprout: null,
    onTurn: null,
    onStep: null
  };
  
  _.extend(profile, settings);

  // Utility functions
  function set_direction(p, dir) {
    p.direction = dir;
    p.destination = vectors.add(p.destination, vectors.multiply(p.direction, p.step));
    p.velocity = vectors.multiply(p.direction, p.speed);
  }

  function in_bounds(position, p) {
    if (!p) p = profile;

    return (p.bounds[0] == null || position[0] >= p.bounds[0]) &&
           (p.bounds[1] == null || position[1] >= p.bounds[1]) &&
           (p.bounds[2] == null || position[0] <= p.bounds[2]) &&
           (p.bounds[3] == null || position[1] <= p.bounds[3]);
  }
  
  // Methods
  _.extend(this, {
    position: [0, 0],

    sproutChance: function() {
      return Math.round(profile.sprouts / profile.step_count * 100);
    },

    hasArrivedAtDestination: function() {
      // Use dot product to determine what side of the destination the current position is on.
      // http://forums.anandtech.com/showthread.php?t=162930
      return vectors.dot(vectors.subtract(profile.destination, profile.position), profile.direction) <= 0;
    },
    
    adjacentDirections: function() {
      return [vectors.leftNormal(profile.direction), vectors.rightNormal(profile.direction)];
    },

    profile: function() {
      return profile;
    },

    clone: function() {
      var copy = _.clone(profile);
      
      _.extend(copy, {
        position: profile.position.slice(0),
        last_position: profile.last_position.slice(0),
        destination: profile.destination.slice(0),
        velocity: profile.velocity.slice(0),
        direction: profile.direction.slice(0),
        trend: profile.trend.slice(0)
      });
      
      return copy;
    },
    
    transform: function(copy) {
      if (profile.transform && _.isFunction(profile.transform)) {
        copy = profile.transform.call(this, copy);
      }
      
      return copy;
    },
    
    // Sprout a new branch
    sprout: function() {
      var choices = _.without(this.adjacentDirections(), profile.direction),
          index = srand.random.range(0, choices.length - 1),
          dir = choices[index],
          copy = _.extend(this.clone(), {
            step_count: 0,
            generation: profile.generation + 1  
          });

      set_direction(copy, dir); 

      if (!in_bounds(copy.destination, copy)) return;

      copy = this.transform(copy); 
      
      // onSprout - callback
      if (profile.onSprout && false === profile.onSprout.call(this, copy)) return false;

      tree.addBranch(new Branch(tree, copy));

      profile.sprouts--;
    },
    
    // Turn left or right
    turn: function() {
      var anti_trend = vectors.multiply(profile.trend, -1),
          directions = _.reject(this.adjacentDirections(), function(i) { return i[0] == anti_trend[0] && i[1] == anti_trend[1]; });
          index = srand.random.range(0, directions.length-1),
          dir = directions[index],
          new_dest = vectors.add(profile.destination, vectors.multiply(dir, profile.step));

      // onTurn - callback
      if (profile.onTurn && false === profile.onTurn.call(this, dir, new_dest)) return false;

      if (!in_bounds(new_dest)) {
        dir = profile.direction;
      } else {
        if (dir[0] == 0 && dir[1] < 0) profile.last_position[1] = profile.position[1] + profile.width - 1;
      }

      set_direction(profile, dir); 
    },
  
    // Turn or Sprout
    arrive: function() {
      if (!in_bounds(profile.position) && profile.momentum <= 0) profile.step_count = profile.max_steps;

      if (profile.momentum > 0) profile.momentum--;

      // onStep - callback
      if (profile.onStep) profile.onStep.call(this);

      if (profile.step_count < profile.max_steps) {
        profile.step_count++;
        this.behave();
      }
    },
    
    // Turn or Sprout
    behave: function() {
      if (profile.momentum <= 0 && srand.random.range(0, 100) > profile.turn_chance) {
        this.turn();
      } else {
        // Go straight
        profile.destination = vectors.add(profile.destination, vectors.multiply(profile.direction, profile.step));
      }
      
      if (profile.generation < profile.max_generations && profile.sprouts > 0 && srand.random.range(100) < this.sproutChance()) {
        this.sprout();
      }
    },
  
    // Update this branch
    update: function(msDuration) {
      if (profile.step_count >= profile.max_steps) return false;

      profile.last_position = profile.position.slice(0);

      if (this.delayed_callback) {
        this.delayed_callback.call(this);
        this.delayed_callback = null;
      }

      profile.position = vectors.add(profile.position, vectors.multiply(profile.velocity, msDuration));

      profile.position[0] = Math.round(profile.position[0]);
      profile.position[1] = Math.round(profile.position[1]);

      if (this.hasArrivedAtDestination()) {
        profile.position = profile.destination.slice(0);
        this.position = profile.position;

        this.delayed_callback = this.arrive;
      }

      // onGrow - callback
      if (profile.onGrow) profile.onGrow.call(this, msDuration);
    },
    
    // Draw the branch
    draw: function(background, foreground) {
      // Moving vertically
      if (profile.direction[0] == 0) {
        gamejs.draw.line(background, profile.color, profile.position, profile.last_position, profile.width);

      // Moving horizontally
      } else {
        var w = profile.width,
            dy = profile.width;

        if (w %2 == 0) w += 1;
        dy = Math.floor(w * 0.5);

        gamejs.draw.line(background, profile.color, [profile.position[0], profile.position[1] + dy], [profile.last_position[0], profile.last_position[1] + dy], w);
      }
    }  
  });


  this.position = profile.position;
  profile.last_position = profile.position.slice(0);
  profile.destination = profile.position.slice(0); 
  set_direction(profile, profile.direction);
};
