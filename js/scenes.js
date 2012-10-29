var gamejs = require('gamejs');
var input = require('input');
var tree = require('tree');


var GameScene = exports.GameScene = function(game) {
  this.game = game;
  this.input_router = new input.Router();

  this.entities = []; 
  
  this.entities.push(new tree.Tree());

  /////////////////////////
  // Update
  /////////////////////////
  this.update = function(msDuration) {
    this.input_router.update(msDuration);

    _.each(this.entities, function(e) {
      e.update(msDuration);
    });
  }
  
  /////////////////////////
  // Draw
  /////////////////////////
  this.draw = function(display) {
    // Clear the canvas before drawing
    //display.clear();

    _.each(this.entities, function(e) {
      e.draw(display);
    });
  }
  
  this.destroy = function() {}
};

