var gamejs = require('gamejs');
var tree = require('tree');

var Oak = exports.Oak = function(seed, settings, finish) {
  var defaults = {
    name: 'Oak',
    leaf_structure: 'Shrub',
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

  return new tree.Tree(seed, settings, finish);
}

var Pine = exports.Pine = function(seed, settings, finish) {
  var defaults = {
    name: 'Pine',
    leaf_structure: 'Shrub',
    width: 20,
    max_steps: 30,
    direction: [0, -1],
    trend: [0, -1],
    momentum: 12,
    sprouts: 20,
    bounds: [null, 100, null, seed[1] - 200], // left, top, right, bottom
    transform: function(branch) {
      _.extend(branch.profile, {
        max_steps: 5,
        width: Math.max(Math.floor(branch.profile.width * 0.5), 1),
        momentum: 5,
        sprouts: 2,
        trend: branch.profile.direction
      }); 

      return branch;
    }
  };

  settings = _.extend(defaults, settings);

  return new tree.Tree(seed, settings, finish);
};

var Willow = exports.Willow = function(seed, settings, finish) {
  var defaults = {
    name: 'Willow',
    leaf_structure: 'Shrub',
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
        width: branch.profile.generation == 1 ? 4 : Math.max(Math.floor(branch.profile.width * 0.75), 1),
        momentum: sideways ? 8 : 0,
        sprouts: sideways ? 4 : 1,
        trend: branch.profile.direction
      }); 

      return branch;
    }
  };

  settings = _.extend(defaults, settings);

  return new tree.Tree(seed, settings, finish);
};

var Down = exports.Down = function(seed, settings, finish) {
  var defaults = {
    name: 'Down',
    leaf_structure: 'Shrub',
    width: 20,
    max_steps: 25,
    direction: [0, -1],
    trend: [0, 1],
    momentum: 1,
    sprouts: 6,
    sprout_delay: 12,
    bounds: [null, 100, null, null], // left, top, right, bottom
    transform: function(branch) {
      _.extend(branch.profile, {
        max_steps: 15,
        width: Math.max(Math.floor(branch.profile.width * 0.25), 1),
        momentum: 3,
        sprouts: 2,
        sprout_delay: 3,
        trend: branch.profile.direction
      }); 

      return branch;
    }
  };

  settings = _.extend(defaults, settings);

  return new tree.Tree(seed, settings, finish);
}


var Bonzai = exports.Bonzai = function(seed, settings, finish) {
  var defaults = {
    name: 'Bonzai',
    leaves: 'images/leaves/summer.png',
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

  return new tree.Tree(seed, settings, finish);
}

var Shrub = exports.Shrub = function(seed, settings, finish) {
  var defaults = {
    name: 'Shrub',
    max_generations: 3,
    width: 1,
    step: 10,
    max_steps: 2,
    direction: [0, -1],
    trend: [0, -1],
    momentum: 1,
    sprouts: 2,
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

  return new tree.Tree(seed, settings, finish);
}

