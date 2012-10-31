var gamejs = require('gamejs');
var vectors = gamejs.utils.vectors;

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


var Tree = exports.Tree = function() {
  this.leads = [];

  this.add_lead({
    position: [500, 400],
    width: 2,
    destination: [500, 350]
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
  this.leads.push(new Lead(this, settings));
};


var Lead = function(tree, settings) {
console.log('new Lead() -- 1');
  this.tree = tree;
  
  var defaults = {
    lifespan: 5,
    speed: 30,
    step: 50,
    
    position: [0, 0],
    last_position: [0, 0],
    destination: [0, 0],
    
    width: 2,
    color: '#000000'
  }
  _.extend(this, defaults, settings);

  this.heading(settings.destination);
};

Lead.prototype.branch = function(settings) {
  var forced_settings = {
    width: this.width / 2
  };
  _.extend(settings, forced_settings);
  this.tree.add_lead(settings);  
};

Lead.prototype.next_step = function() {
  var new_direction;

  if (this.lifespan % 2 == 0) {
    new_direction = vectors.leftNormal(this.direction); 
  } else {
    new_direction = vectors.rightNormal(this.direction); 
  }

  var new_destination = vectors.add(this.destination, vectors.multiply(new_direction, this.step));
  this.position = this.destination.slice(0);
  this.heading(new_destination);
};

Lead.prototype.heading = function(destination) {
  this.destination = destination; // the destination of the line
  this.direction = vectors.unit(vectors.subtract(this.destination, this.position)); // unit direction of the heading
  this.velocity = vectors.multiply(this.direction, this.speed);
};

Lead.prototype.has_arrived = function() {
  // Use dot product to determine what side of the destination the current position is on.
  // http://forums.anandtech.com/showthread.php?t=162930
  return vectors.dot(vectors.subtract(this.destination, this.position), this.direction) <= 0;
};

Lead.prototype.update = function(msDuration) {
  if (this.lifespan <= 0) return;

  this.last_position = this.position.slice(0);
  this.position = vectors.add(this.position, vectors.multiply(this.velocity, msDuration));

  if (this.has_arrived()) {
    this.lifespan--;
    this.next_step();
  }
};

Lead.prototype.draw = function(display) {
  gamejs.draw.line(display, this.color, this.position, this.last_position, this.width);
};
