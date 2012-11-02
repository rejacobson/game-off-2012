var gamejs = require('gamejs');
var input = require('input');
var tree = require('tree');
var terrain = require('terrain');


var GameScene = exports.GameScene = function(game) {
  this.game = game;
  this.input_router = new input.Router();
  this.entities = []; 

  var platforms = new terrain.PlatformManager();
  
  var trunk = new tree.Tree({
    // Called when a branch changes direction
    onBend: function() {

    },

    // Called when a new branch is spawned
    onBranch: function() {
console.log('New Branch!!!!');
console.log(this);
    },

    // Called when a branch is updated
    onGrow: function(msDuration) {

    }
  });

  this.entities.push(trunk);
  this.entities.push(platforms);

  platforms.insert(new terrain.Platform(100, 300, 200));
  platforms.insert(new terrain.Platform(200, 400, 300));
  platforms.insert(new terrain.Platform(300, 350, 400));
  platforms.insert(new terrain.Platform(180, 300, 250));



  /////////////////////////
  // Update
  /////////////////////////
  this.update = function(msDuration) {
    this.input_router.update(msDuration);

    _.each(this.entities, function(e) {
      if (e.update) e.update(msDuration);
    });
  }
  
  /////////////////////////
  // Draw
  /////////////////////////
  this.draw = function(displays) {
    // Clear the canvas before drawing
    //display.clear();

    _.each(this.entities, function(e) {
      if (e.draw) e.draw(displays['background']);
    });
  }
  
  this.destroy = function() {}
};

