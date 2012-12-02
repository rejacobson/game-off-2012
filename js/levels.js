var gamejs = require('gamejs');
var vectors = gamejs.utils.vectors;
var util = require('util');
var srand = require('srand');
var platforms = require('partitions/platforms');
var poles = require('partitions/poles');
var entities = require('partitions/entities');
var gamescreen = require('gamescreen').instance();
var tree = require('tree');
var tree_species = require('tree_species');
var mob = require('mob');

// Load a new level
exports.load = function(level) {
  return new Level(levels[level]); 
};

//
var World = exports.World = function(worldsize) {
  var world = {};

  return _.extend(world, {
    size: worldsize,
    trees: [],
    player: mob.factory(world, 'hero'),

    platforms: new platforms.PlatformManager(worldsize[1], 50),
    poles: new poles.PoleManager(worldsize[0], 50),
    entities: new entities.EntityManager(worldsize, [50, 50])
  });
};

//
var Level = exports.Level = function(settings) {
  var self = this;

  this.testing_finished_state = false;

  this.settings = settings;
  this.world = new World(settings.worldsize);
  this.mobs = [];

  _.each(this.settings.mobs, function(count, name) {
    for (var i=0; i<count; ++i) {
      self.mobs.push(name); 
    }
  });
  this.mobs = _.shuffle(this.mobs);

  // Insert ground platforms
  this.insertGround(this.settings.ground);

  // Plant trees
  this.plantTrees(this.settings.trees);

  // Insert the player into the world
  this.world.entities.insert(this.world.player);

  // Position the player at their spawn point
  this.spawnPlayer();
  
  // Setup the camera and views
  gamescreen.clear();
  gamescreen.levelSize(this.world.size);
  gamescreen.moveTo(this.world.player.position);
  gamescreen.follow(this.world.player);
};

Level.prototype.finished = function() {
  if (!this.world.player.alive) return 'lose';
  if (!this.testing_finished_state) return false;
  if (this.world.entities.size() == 1 && this.world.entities.get()[0] == this.world.player) return 'win'; 
  return false;
};

// Insert ground platforms
Level.prototype.insertGround = function(ground) {
  var self = this;
  _.each(ground, function(g) { 
    //                                                 left  right top
    self.world.platforms.insert( new platforms.Platform(g[0], g[1], g[2], {fall_through: false}) );
  });
};

// Position the player at their spawn point
Level.prototype.spawnPlayer = function() {
  // Ensure the player spawn point is above the first ground platform
  var g = this.settings.ground[0];

  if (this.settings.spawn[0] > g[1]) {

    // Set spawn 10 in from the right edge
    this.settings.spawn[0] = g[1] - 10;

  } else if (this.settings.spawn[0] < g[0]) {

    // Set spawn 10 in from the left edge
    this.settings.spawn[0] = g[0] + 10;
  }

  // Players Y spawn point is on the first ground platform
  this.settings.spawn[1] = g[2];

  this.world.player.position = this.settings.spawn.slice(0);
};

Level.prototype.plantTrees = function(trees) {
  var self = this, tree;

  var _defaults = {
    onSprout: function(new_direction, new_destination) {
      this.profile.onTurn.call(this, new_direction, new_destination);
    },

    // Called when a branch changes direction
    onTurn: function(new_direction, new_destination) {

      // Branched left or right
      if (new_direction[1] == 0) {
        this.platform = new platforms.Platform(this.position[0], this.position[0], this.position[1]); 
        self.world.platforms.insert(this.platform);

        if (this.pole) {
          self.world.poles.mergeOverlapping(this.pole);
          this.pole = null;
        }


      // Branched up or down
      } else {
        this.pole = new poles.Pole(this.position[1], this.position[1], this.position[0], Math.max(Math.floor(this.profile.width * 0.25))); 
        self.world.poles.insert(this.pole);

        if (this.platform) {
          self.world.platforms.mergeOverlapping(this.platform);
          this.platform = null;
        }
      }
    },

    // Called when a branch is updated
    onGrow: function(msDuration) {

      // Platform growth 
      if (this.platform && this.profile.direction[1] == 0) {
        // Growing right
        if (this.profile.direction[0] > 0) {
          if (this.platform.right < this.position[0]) {
            this.platform.right = this.position[0];
          }

        // Growing left
        } else {
          if (this.platform.left > this.position[0]) this.platform.left = this.position[0];
        }

        // Spawn a monster
        if (srand.random.range(1000) >= 995) {
          var monster = self.mobs[ srand.random.range(self.mobs.length-1) ]; 
          self.world.entities.insert( mob.factory(self.world, monster, {}, {position: [this.position[0], this.position[1]-2]}) );
        } 
      }

      // Pole growth
      if (this.pole && this.profile.direction[0] == 0) {
        // Growing down
        if (this.profile.direction[1] > 0) {
          if (this.pole.bottom < this.position[1]) this.pole.bottom = this.position[1];

        // Growing up
        } else {
          if (this.pole.top > this.position[1]) this.pole.top = this.position[1];
        }
      }
    }

  };


  _.each(trees, function(opts, type) {
    
    tree = tree_species[type](opts.seed, _.extend(opts.settings, _defaults), function() {
      // Begin testing for the end of the level
      self.testing_finished_state = true;
    }); 

    self.world.trees.push(tree);

  });

/*
  // Plant trees
  _.each(seeds, function(s) {
    self.world.trees.push(plantTree(self.world, s, {
      onFinished: function() {
        // Begin testing for the end of the level
        self.testing_finished_state = true;
      },

      onGrowHorizontal: function(platform, direction) {
        //
        // Randomly spawn a monster
        //
        if (srand.random.range(1000) >= 995) {

          // Spawn a monster
          var monster = self.mobs[ srand.random.range(self.mobs.length-1) ]; 
          self.world.entities.insert( mob.factory(self.world, monster, {}, {position: [this.position[0], this.position[1]-2]}) );
        } 
      }

    })); 
  });
*/

};


var levels = {};

levels['level1'] = {
  worldsize: [2000, 800],
  spawn: [800, 700],
  ground: [[600, 1400, 700], [300, 700, 600]],  // First one is always the spawn point
  mobs: {
    'buggaloo': 15,
    'bunny': 15,
    'gazer': 5
  },
  trees: {
    'Oak': { 
      seed: [1000, 700],
      settings: {
        leaf: {
          structure: 'Shrub',
          spritesheet: 'images/leaves/summer.png',
          density: 3,
          spread: [15, 15]
        }
      }
    }
  },
};

levels['level2'] = {
  worldsize: [2000, 800],
  spawn: [800, 700],
  ground: [[600, 1400, 700]],  // First one is always the spawn point
  seeds: [[1400, 700]],
  mobs: {
    'spiky': 15,
    'snake': 15,
    'mouth': 5
  }
};




/*
var plantTree = function(world, position, settings) {
  var rules = _.extend({
    onFinished: null,

    onBranchHorizontal: null,
    onBranchVertical: null,

    onGrowHorizontal: null,
    onGrowVertical: null
  }, settings);

  return new tree.Tree(position, {
    onFinished: rules.onFinished,

    // Called when a branch changes direction
    onTurn: function() {

      // Branched left or right
      if (this.direction[1] == 0) {
        this.platform = new platforms.Platform(this.position[0], this.position[0], this.position[1]); 
        world.platforms.insert(this.platform);

        if (rules.onBranchHorizontal) rules.onBranchHorizontal.call(this, this.platform, this.pole, this.direction);

        if (this.pole) {
          world.poles.mergeOverlapping(this.pole);
          this.pole = null;
        }


      // Branched up or down
      } else {
        this.pole = new poles.Pole(this.position[1], this.position[1], this.position[0]); 
        world.poles.insert(this.pole);

        if (rules.onBranchVertical) rules.onBranchVertical.call(this, this.pole, this.platform, this.direction);

        if (this.platform) {
          world.platforms.mergeOverlapping(this.platform);
          this.platform = null;
        }
        
      }

    },

    // Called when a branch is updated
    onGrow: function(msDuration) {

      // Platform growth 
      if (this.platform && this.direction[1] == 0) {
        // Growing right
        if (this.direction[0] > 0) {
          if (this.platform.right < this.position[0]) this.platform.right = this.position[0];

        // Growing left
        } else {
          if (this.platform.left > this.position[0]) this.platform.left = this.position[0];
        }

        if (rules.onGrowHorizontal) rules.onGrowHorizontal.call(this, this.platform, this.direction);
      }

      // Pole growth
      if (this.pole && this.direction[0] == 0) {
        // Growing down
        if (this.direction[1] > 0) {
          if (this.pole.bottom < this.position[1]) this.pole.bottom = this.position[1];

        // Growing up
        } else {
          if (this.pole.top > this.position[1]) this.pole.top = this.position[1];
        }

        if (rules.onGrowVertical) rules.onGrowVertical.call(this, this.pole, this.direction);
      }
      
    }
  });
};
*/
