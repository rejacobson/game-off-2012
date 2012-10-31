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
    lifespan: 15,
    speed: 100,
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

Lead.prototype.grow = function() {
  var new_destination = this.available_destinations()[roll(3)];
  this.position = this.destination.slice(0);
  this.heading(new_destination);
};

Lead.prototype.heading = function(destination) {
  this.destination = destination; // the destination of the line
  this.direction = vectors.unit(vectors.subtract(this.destination, this.position)); // unit direction of the heading
  this.velocity = vectors.multiply(this.direction, this.speed);
};

Lead.prototype.available_destinations = function() {
  var forward = this.direction,
      left = vectors.leftNormal(this.direction),
      right = vectors.rightNormal(this.direction);

  return [
    vectors.add(this.destination, vectors.multiply(forward, this.step)),
    vectors.add(this.destination, vectors.multiply(left, this.step)),
    vectors.add(this.destination, vectors.multiply(right, this.step))
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
  this.position = vectors.add(this.position, vectors.multiply(this.velocity, msDuration));

  if (this.has_arrived()) {
    this.lifespan--;
    this.grow();
  }
};

Lead.prototype.draw = function(display) {
  gamejs.draw.line(display, this.color, this.position, this.last_position, this.width);
};
