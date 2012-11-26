var gamejs = require('gamejs');
var levels = require('levels');
var gamescreen = require('gamescreen').instance();
var input = require('input');
var collision = require('collision');
var mob = require('mob');
var tree = require('tree');

var GameScene = exports.GameScene = function(level) {
  this.input_router = new input.Router();

  var level = levels.load(level);
  var world = level.world;

  // Player
  world.player.controller = new input.Controller(world.player, mob.roster['hero'].keys, mob.roster['hero'].actions); 
  this.input_router.register(world.player.controller);
  this.handleEvent = this.input_router.handleEvent;

  collider = new collision.Resolver(world.entities);

  var status;

  /////////////////////////
  // Update
  /////////////////////////
  this.update = function(msDuration) {
    gamescreen.update(msDuration);

    this.input_router.update(msDuration);

    world.entities.update(msDuration);
    
    // Collision detection
    collider.resolve();

    for (var i = 0, len = world.trees.length; i<len; ++i) {
      world.trees[i].update(msDuration);
    };

    if (status = level.finished()) {
console.log(status); 
$(document).trigger('pause');
    }
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



var SplashScene = exports.SplashScene = function() {
  var worldsize = [1200, 2000],
      seed_at = [600, 1900],
      trunk;

  gamescreen.levelSize(worldsize);

  var seed = function() {
    trunk = new tree.Tree(seed_at.slice(0));
    gamescreen.display('background').clear();
    gamescreen.clear();
    gamescreen.moveTo(trunk.leads[0].position);
    gamescreen.follow(trunk.leads[0]);
  }
  
  seed();

  this.update = function(msDuration) {
    gamescreen.update(msDuration);
    trunk.update(msDuration);

    if (trunk.finished) {
      seed();
    }
  }

  this.draw = function() {
    trunk.draw(gamescreen.display('background'));
  };

};
