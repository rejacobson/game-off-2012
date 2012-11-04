var gamejs = require('gamejs');
var input = require('input');
var tree = require('tree');
var terrain = require('terrain');


var GameScene = exports.GameScene = function(game) {
  this.game = game;
  this.input_router = new input.Router();
  this.entities = []; 

  var platforms = new terrain.PlatformManager();
  platforms.insert(new terrain.Platform(0, 1200, 500)); 
  
  var trunk = new tree.Tree({
    // Called when a branch changes direction
    onBranch: function() {
      if (this.direction[1] == 0 && !this.platform) {
        this.platform = new terrain.Platform(this.position[0], this.position[0], this.position[1]); 
        platforms.insert(this.platform);
      } else {
        this.platform = null;
      }
    },

    // Called when a branch is updated
    onGrow: function(msDuration) {
      if (!this.platform || this.direction[0] == 0) return;
      
      if (this.direction[0] > 0) {
        this.platform.right = this.position[0];
      } else {
        this.platform.left = this.position[0];
      } 
    }
  });

  this.entities.push(trunk);
  this.entities.push(platforms);


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

