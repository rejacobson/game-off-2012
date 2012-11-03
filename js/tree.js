var gamejs = require('gamejs');
var vectors = gamejs.utils.vectors;

function roll(max) {
  return Math.floor(Math.random() * max);
};

vectors.len_sq = function(v) {
  return v[0]*v[0] + v[1]*v[1];
};

vectors.distance_sq = function(a, b) {
  vectors.len_sq(vectors.subtract(a, b)); 
};

vectors.leftNormal = function(v) {
  return [v[1], -v[0]];
};

vectors.rightNormal = function(v) {
  return [-v[1], v[0]];
};

vectors.toString = function(v) {
  return v[0]+':'+v[1];
};

vectors.round = function(v) {
  v[0] = Math.round(v[0]);
  v[1] = Math.round(v[1]);
  return v;
};

var Tree = exports.Tree = function(settings) {
  this.leads = [];
  this.base = [500, 500];

  this.settings = {
    onBend: function() {},
    onBranch: function() {},
    onGrow: function() {}
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
    bounds: [null, 50, null, 450]
  });
};

Tree.prototype.update = function(msDuration) {
  _.each(this.leads, function(lead) {
    lead.update(msDuration);
  });
};

Tree.prototype.draw = function(display) {
  _.each(this.leads, function(lead) {
    lead.draw(display);
  });
};

Tree.prototype.add_lead = function(settings) {
  var lead = new Lead(this, settings);
  this.leads.push(lead);
  if (this.settings.onBranch) {
    this.settings.onBranch.call(lead);
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
    color: '#000000'
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

Lead.prototype.branch = function(settings) {
  var forced_settings = {
    generation: this.generation + 1,
    width: Math.round(this.width / 2)
  };
  _.extend(settings, forced_settings);
  this.tree.add_lead(settings);  
};

Lead.prototype.grow = function() {
  var self = this;
  // Branching directions
  var branch_directions = [vectors.leftNormal(this.direction), vectors.rightNormal(this.direction)];
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

    var new_direction = directions[roll(directions.length)];
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

  if (this.generation < 3 && this.width >= 2 && roll(100) < this.sprout_percentage()) {
    branch_directions = _.without(branch_directions, this.direction); //_.reject(branch_directions, function(d) { d == this.direction });
    var dir = branch_directions[roll(branch_directions.length)];
    var dest = vectors.add(this.position, vectors.multiply(dir, this.step));

    if (this.in_bounds(dest)) {
      this.branch({
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

Lead.prototype.candidate_destinations = function() {
  var directions = this.candidate_directions();
  var destinations = [];

  var self = this;
  _.each(directions, function(d) {
    destinations.push( vectors.add(self.destination, vectors.multiply(d, self.step)) );
  });

  return destinations;
};

Lead.prototype.candidate_directions = function() {
  return [
    this.direction,
    vectors.leftNormal(this.direction),
    vectors.rightNormal(this.direction)
  ]; 
};

Lead.prototype.has_arrived = function() {
  // Use dot product to determine what side of the destination the current position is on.
  // http://forums.anandtech.com/showthread.php?t=162930
  return vectors.dot(vectors.subtract(this.destination, this.position), this.direction) <= 0;
};

Lead.prototype.update = function(msDuration) {
  if (this.lifespan <= 0) return;

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
  gamejs.draw.line(display, this.color, this.position, this.last_position, this.width);
};
