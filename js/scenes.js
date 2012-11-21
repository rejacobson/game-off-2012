var gamejs = require('gamejs');
var levels = require('levels');
var gamescreen = require('gamescreen').instance();
var input = require('input');
//var tree = require('tree');

//var platforms = require('partitions/platforms');
//var poles = require('partitions/poles');
//var entities = require('partitions/entities');

var mob = require('mob');

var GameScene = exports.GameScene = function(game) {
  this.game = game;
  this.input_router = new input.Router();

  var world = levels.level[1].load();

  // Player
  world.player.controller = new input.Controller(world.player, mob.roster['hero'].keys, mob.roster['hero'].actions); 
  this.input_router.register(world.player.controller);
  this.handleEvent = this.input_router.handleEvent;


  /////////////////////////
  // Update
  /////////////////////////
  this.update = function(msDuration) {
    gamescreen.update(msDuration);

    this.input_router.update(msDuration);

    world.entities.update(msDuration);
    
/*
    // Collision detection
    _.each(world.entities.mapUsage(), function(count, index) {
      if (count > 1) {
        var current = world.entities.mapFetch(index), 
            surroundings = world.entities.mapFetchSurrounding(index);

        for (var i=0, ilen=current.length; i<len; ++i) {
          for (var j=0, jlen=surroundings.length; j<len; ++j) {
            //var e1 = current[i], e2 = surroundings    
          };
        };
        
      }
    });
*/

    for (var i = 0, len = world.trees.length; i<len; ++i) {
      world.trees[i].update(msDuration);
    };
  }
  
  /////////////////////////
  // Draw
  /////////////////////////
  this.draw = function() {
    for (var i = 0, len = world.trees.length; i<len; ++i) {
      world.trees[i].draw(gamescreen.display('background'));
    };

    world.platforms.draw(gamescreen.display('background'));

    world.poles.draw(gamescreen.display('background'));

    // Clear the canvas before drawing
    gamescreen.display('main').clear();

    world.entities.draw(gamescreen.display('main'));
  
    //gamescreen.draw(gamescreen.display('main'));
  }
  
  this.destroy = function() {}
};

