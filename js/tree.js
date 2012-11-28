var gamejs = require('gamejs');
var srand = require('srand');
var util = require('util');
var vectors = gamejs.utils.vectors;


var Tree = exports.Tree = function(seed, trunk_settings) {
  var branches = [];
  
  this.callbacks = {};
    
  _.extend(this, {
    
    finished: function() {
      return branches.length <= 0;
    },
  
    addBranch: function(branch) {
      branches.push(branch);
    },
  
    removeBranch: function(branch) {
      var i = _.indexOf(branches, branch);
      if (-1 != i) branches.splice(i, 1);
    },

    branches: function() {
      return branches;
    },
  
    update: function(msDuration) {
      if (this.finished()) return false;

      var branch, dead = [];
      for (var i=0, len=branches.length; i<len; ++i) {
        branch = branches[i];

        if (false === branch.update(msDuration)) {
          dead.push(branch);
        };
      }
      
      for (var i=0, len=dead.length; i<len; ++i) {
        this.removeBranch(dead[i]);
      }
      
      if (this.finished()) {
        if (this.callbacks.onFinished && _.isFunction(this.callbacks.onFinished())) this.callbacks.onFinished.call(this);
      }
    },
    
    draw: function(background, foreground) {
      for (var i=0, len=branches.length; i<len; ++i) {
        branches[i].draw(background, foreground);
      };
    }
  });
  
  trunk_settings = {
    position: seed.slice(0),
    width: 25,
    lifespan: 15,
    direction: [0, -1],
    trend: [0, -1],
    momentum: 3,
    sprouts: 6
  };

console.log('new Tree !!!!!!!!!!!!!!!!!!!!!!!');
  this.addBranch(new Branch(this, trunk_settings));
};


var Branch = function(tree, settings) {
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
    lifespan: 0,
    
    turn_chance: 20,
    sprout_chance: 20,
    
    color: '#521300'   
  };
  
  _.extend(profile, settings);

  // Utility functions
  function set_direction(p, dir) {
    p.direction = dir;
    p.destination = vectors.add(p.destination, vectors.multiply(p.direction, p.step));
    p.velocity = vectors.multiply(p.direction, p.speed);
  }
  
  // Methods
  _.extend(this, {

    arrived_at_destination: function() {
      // Use dot product to determine what side of the destination the current position is on.
      // http://forums.anandtech.com/showthread.php?t=162930
      return vectors.dot(vectors.subtract(profile.destination, profile.position), profile.direction) <= 0;
    },
    
    adjacent_directions: function() {
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
    
    transform: function() {
      var copy = this.clone(profile);
      
      if (profile.transform && _.isFunction(profile.transform)) {
        copy = profile.transform.call(this, copy);
      }
      
      return copy;
    },
    
    // Sprout a new branch
    sprout: function() {
      var choices = _.without(this.adjacent_directions(), profile.direction),
          index = srand.random.range(0, choices.length),
          dir= choices[index],
          clone = this.clone();
          
      clone.generation = profile.generation - 1;
      set_direction(clone, dir); 
      tree.addBranch(new Branch(tree, clone));
    },
    
    // Turn left or right
    turn: function() {
      var anti_trend = vectors.multiply(profile.trend, -1),
          directions = _.reject(this.adjacent_directions(), function(i) { return i[0] == anti_trend[0] && i[1] == anti_trend[1]; });
          index = srand.random.range(0, directions.length-1),
          dir = directions[index];

      set_direction(profile, dir); 
    },
  
    // Turn or Sprout
    arrive: function() {
      profile.position = profile.destination.slice(0);
      //if (!in_bounds(profile.position)) profile.lifespan = 0;
      if (profile.momentum > 0) profile.momentum--;
      if (profile.lifespan > 0) {
        profile.lifespan--;
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
      
      if (srand.random.range(0, 100) > profile.sprout_chance) {
        this.sprout();
      }
    },
  
    // Update this branch
    update: function(msDuration) {
      if (profile.lifespan <= 0) return false;

      profile.last_position = profile.position.slice(0);
      profile.position = vectors.add(profile.position, vectors.multiply(profile.velocity, msDuration));
      profile.position[0] = Math.round(profile.position[0]);
      profile.position[1] = Math.round(profile.position[1]);

      if (this.arrived_at_destination()) {
        this.arrive();
      }
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

  profile.last_position = profile.position.slice(0);
  profile.destination = profile.position.slice(0); 
  set_direction(profile, profile.direction);
};
