var gamejs = require('gamejs');
var input = require('input');
var tree = require('tree');
var terrain = require('terrain');
var entity = require('entity');
var avatar = require('avatar');


var GameScene = exports.GameScene = function(game) {
  this.game = game;
  this.input_router = new input.Router();
  this.entities = []; 

  var platforms = new terrain.PlatformManager(600, 20);
  var ground = new terrain.Platform(0, 1200, 500, {is_ground: true});
  platforms.insert(ground); 

  var trunk = new tree.Tree({
    // Called when a branch changes direction
    onBranch: function() {
      // Branched left or right
      if (this.direction[1] == 0) {
        this.platform = new terrain.Platform(this.position[0], this.position[0], this.position[1]); 
        platforms.insert(this.platform);

      // Branched up or down
      } else {
        if (this.platform) {
          platforms.mergeOverlapping(this.platform);
        }

        this.platform = null;
      }
    },

    // Called when a branch is updated
    onGrow: function(msDuration) {
      if (!this.platform || this.direction[0] == 0) return;
      
      // Growing right
      if (this.direction[0] > 0) {
        if (this.platform.right < this.position[0]) this.platform.right = this.position[0];

      // Growing left
      } else {
        if (this.platform.left > this.position[0]) this.platform.left = this.position[0];
      }
    }
  });

  // Player
  this.player = new entity.Creature('player', {
    stats: {
      speed: 100
    },
    avatar: new avatar.Image('images/player.png'),
    position: [100, 500],
    platform: ground,
    update: function(msDuration) { }
  });

  this.entities.push(this.player);

  this.player.controller = new input.Controller(this.player, entity.basic_action_map, entity.BasicActions);
  this.input_router.register(this.player.controller);

  this.handleEvent = this.input_router.handleEvent;


  /////////////////////////
  // Update
  /////////////////////////
  this.update = function(msDuration) {
    this.input_router.update(msDuration);

    _.each(this.entities, function(e) {
      if (e.update) e.update(msDuration, platforms);
    });

    trunk.update(msDuration);
  }
  
  /////////////////////////
  // Draw
  /////////////////////////
  this.draw = function(displays) {
    trunk.draw(displays['background']);
    platforms.draw(displays['background']);

    // Clear the canvas before drawing
    displays['foreground'].clear();

    _.each(this.entities, function(e) {
      if (e.draw) e.draw(displays['foreground']);
    });
  }
  
  this.destroy = function() {}
};


gamejs.preload(['images/player.png']);
