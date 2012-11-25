var gamejs = require('gamejs');
var srand = require('srand');
var util = require('util');
var vectors = gamejs.utils.vectors;


var Tree = exports.Tree = function(seed_position, settings) {
  this.leads = [];
  this.base = seed_position;
  this.finished = false;

  this.settings = {
    onBend: function() {},
    onBranch: function() {},
    onGrow: function() {},
    onFinished: function() {}
  };
  _.extend(this.settings, settings);

  this.add_lead({
    position: this.base.slice(0),
    width: 25,
    lifespan: 15,
    direction: [0, -1],
    trend: [0, -1],
    momentum: 3,
    sprouts: 6,
    bounds: [null, 100, null, this.base[1] - 50] // left, top, right, bottom
  });
};

Tree.prototype.update = function(msDuration) {
  if (this.finished) return false;

  if (!this.leads.length) {
    this.finished = true;
    if (this.settings.onFinished && _.isFunction(this.settings.onFinished())) {
      this.settings.onFinished.call(this);
    }
    return false;
  }

  var lead, dead = [];
  for (var i=0, len=this.leads.length; i<len; ++i) {
    lead = this.leads[i];

    if (false === lead.update(msDuration)) {
      dead.push(lead);
    };
  }

  for (var i=0, len=dead.length; i<len; ++i) {
    this.remove_lead(dead[i]);
  }
};

Tree.prototype.draw = function(display) {
  for (var i=0, len=this.leads.length; i<len; ++i) {
    this.leads[i].draw(display);
  };
};

Tree.prototype.add_lead = function(settings) {
  var lead = new Lead(this, settings);
  this.leads.push(lead);
  if (this.settings.onBranch) {
    this.settings.onBranch.call(lead);
  }
};

Tree.prototype.remove_lead = function(lead) {
  var i = _.indexOf(this.leads, lead);
  if (-1 != i) {
    this.leads.splice(i, 1);
  } 
};


var Lead = function(tree, settings) {
  this.tree = tree;
  
  var defaults = {
    generation: 0,
    lifespan: 15,
    speed: 150,
    step: 50,
    trend: null,
    momentum: 0,
    sprouts: 0,
    bounds: [null, null, null, null], // left, top, right, bottom bounds
    
    position: [0, 0],
    last_position: [0, 0],
    destination: [0, 0],
    
    width: 2,
    color: '#521300'
  }
  _.extend(this, defaults, settings);

  this.heading(settings.direction);
};

Lead.prototype.in_bounds = function(position) {
  return (this.bounds[0] == null || position[0] >= this.bounds[0]) &&
         (this.bounds[1] == null || position[1] >= this.bounds[1]) &&
         (this.bounds[2] == null || position[0] <= this.bounds[2]) &&
         (this.bounds[3] == null || position[1] <= this.bounds[3]);
};

Lead.prototype.sprout_percentage = function() {
  return Math.round(this.sprouts / this.lifespan * 100);
};

Lead.prototype.sprout = function(settings) {
  var forced_settings = {
    generation: this.generation + 1,
    width: Math.round(this.width / 2)
  };
  _.extend(settings, forced_settings);
  this.tree.add_lead(settings);  
};

Lead.prototype.grow = function() {
  var self = this;

  // Sprouting directions
  var sprout_directions = [vectors.leftNormal(this.direction), vectors.rightNormal(this.direction)];
  var directions = this.candidate_directions();
  var new_direction = this.direction;
  var turning = false;

  if (this.momentum <= 0) {
    if (this.trend) {
      var measured_directions = [];
      _.each(directions, function(dir, i) {
        measured_directions.push({dir: dir, dot: vectors.dot(self.trend, dir)});
      }); 
     
      // Sort by the dot product
      measured_directions.sort(function(a, b) { return a.dot - b.dot; });

      // Remove the negative direction
      if (measured_directions[0].dot < 0) measured_directions.splice(0, 1); 

      // Weight the destinations
      directions = [];
      _.each(measured_directions, function(d) {
        var n = Math.floor(d.dot + 1) * 4;
        for (; n > 0; n--) {
          directions.push(d.dir);
        }
      });

      directions = _.shuffle(directions);
    }

    var new_direction = directions[srand.random.range(directions.length-1)];
    var new_destination = vectors.add(this.position, vectors.multiply(new_direction, this.step));

    if (!this.in_bounds(new_destination)) {
      new_direction = this.direction;
    }
  }

  if (new_direction != this.direction) turning = true; 

  this.position = this.destination.slice(0);
  this.heading(new_direction);

  if (turning && this.tree.settings.onBranch) {
    this.tree.settings.onBranch.call(this);
  }

  if (this.generation < 3 && this.width >= 2 && srand.random.range(100) < this.sprout_percentage()) {
    sprout_directions = _.without(sprout_directions, this.direction); //_.reject(sprout_directions, function(d) { d == this.direction });
    var dir = sprout_directions[srand.random.range(sprout_directions.length-1)];
    var dest = vectors.add(this.position, vectors.multiply(dir, this.step));

    if (this.in_bounds(dest)) {
      this.sprout({
        position: this.position.slice(0),
        last_position: this.position.slice(0),
        direction: dir,
        trend: dir,
        lifespan: 8,
        momentum: 3,
        sprouts: 2,
        bounds: this.bounds
      });  
      this.sprouts--;
    }
  }
};

Lead.prototype.heading = function(direction) {
  this.direction = direction;
  this.destination = vectors.add(this.position, vectors.multiply(this.direction, this.step)); 
  this.velocity = vectors.multiply(this.direction, this.speed);
};

Lead.prototype.candidate_directions = function() {
  return [
    vectors.leftNormal(this.direction),
    this.direction,
    vectors.rightNormal(this.direction)
  ]; 
};

Lead.prototype.has_arrived = function() {
  // Use dot product to determine what side of the destination the current position is on.
  // http://forums.anandtech.com/showthread.php?t=162930
  return vectors.dot(vectors.subtract(this.destination, this.position), this.direction) <= 0;
};

Lead.prototype.update = function(msDuration) {
  if (this.lifespan <= 0) return false;

  this.last_position = this.position.slice(0);
  this.position = vectors.round(vectors.add(this.position, vectors.multiply(this.velocity, msDuration)));

  if (this.tree.settings.onGrow) this.tree.settings.onGrow.call(this, msDuration);

  if (this.has_arrived()) {
    if (!this.in_bounds(this.position)) this.lifespan = 0;
    if (this.momentum > 0) this.momentum--;
    if (this.lifespan > 0) {
      this.lifespan--;
      this.grow();
    }
  }
};

Lead.prototype.draw = function(display) {
  // Moving vertically
  if (this.direction[0] == 0) {
    gamejs.draw.line(display, this.color, this.position, this.last_position, this.width);

  // Moving horizontally
  } else {
    var dy = this.width * 0.5; 
    gamejs.draw.line(display, this.color, [this.position[0], this.position[1] + dy], [this.last_position[0], this.last_position[1] + dy], this.width);
  }
};
