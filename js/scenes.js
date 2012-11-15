var gamejs = require('gamejs');
var input = require('input');
var tree = require('tree');

var platforms = require('partitions/platforms');
var poles = require('partitions/poles');
var entities = require('partitions/entities');

var mob = require('mob');

var GameScene = exports.GameScene = function(game) {
  this.game = game;
  this.input_router = new input.Router();

  var level = {
    size: [1200, 1200]
  };

  var camera = {
    size: [1200, 500]
  };

  var world = {
    platforms: new platforms.PlatformManager(600, 20),
    poles: new poles.PoleManager(1200, 20),
    entities: new entities.EntityManager([1200, 600], [16, 8])
  }

  var ground = new platforms.Platform(100, 1100, 500, {is_ground: true});
  world.platforms.insert(ground);

  var trunk = new tree.Tree({

    // Called when a branch changes direction
    onBranch: function() {

      // Branched left or right
      if (this.direction[1] == 0) {
        this.platform = new platforms.Platform(this.position[0], this.position[0], this.position[1]); 
        world.platforms.insert(this.platform);

        if (this.pole) {
          world.poles.mergeOverlapping(this.pole);
          this.pole = null;
        }


      // Branched up or down
      } else {
        this.pole = new poles.Pole(this.position[1], this.position[1], this.position[0]); 
        world.poles.insert(this.pole);

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
      }

      // Pole growth
      if (this.pole && this.direction[0] == 0) {
        // Growing right
        if (this.direction[1] > 0) {
          if (this.pole.bottom < this.position[1]) this.pole.bottom = this.position[1];

        // Growing left
        } else {
          if (this.pole.top > this.position[1]) this.pole.top = this.position[1];
        }
      }
      
    }
  });

  // Player
  var player = mob.factory(world, 'hero', {}, {position: [200, 499]});
  player.controller = new input.Controller(player, mob.roster['hero'].keys, mob.roster['hero'].actions); 
  this.input_router.register(player.controller);
  this.handleEvent = this.input_router.handleEvent;

  world.entities.insert(player);

  world.entities.insert( mob.factory(world, 'toothface') );
  

  /////////////////////////
  // Update
  /////////////////////////
  this.update = function(msDuration) {
    this.input_router.update(msDuration);
    world.entities.update(msDuration);
    trunk.update(msDuration);
  }
  
  /////////////////////////
  // Draw
  /////////////////////////
  this.draw = function(displays) {
    trunk.draw(displays['background']);
    world.platforms.draw(displays['background']);
    world.poles.draw(displays['background']);

    // Clear the canvas before drawing
    displays['foreground'].clear();

    world.entities.draw(displays['foreground']);
  }
  
  this.destroy = function() {}
};

