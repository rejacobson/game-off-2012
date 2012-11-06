var gamejs = require('gamejs');
var input = require('input');
var tree = require('tree');

var platforms = require('partitions/platforms');
var poles = require('partitions/poles');
var entities = require('partitions/entities');

var entity = require('entity');
var avatar = require('avatar');


var GameScene = exports.GameScene = function(game) {
  this.game = game;
  this.input_router = new input.Router();
  this.entities = []; 

  var world = {
    platforms: new platforms.PlatformManager(600, 20),
    poles: new poles.PoleManager(1200, 20),
    entities: new entities.EntityManager(1200, 600)
  }

  var ground = new platforms.Platform(0, 1200, 500, {is_ground: true});
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
  this.player = new entity.Creature(world, 'player', {
    stats: {
      speed: 100
    },
    avatar: new avatar.Image('images/player.png'),
    position: [100, 500],
    platform: ground,
    pole: null,
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
      if (e.update) e.update(msDuration, world.platforms);
    });

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

    _.each(this.entities, function(e) {
      if (e.draw) e.draw(displays['foreground']);
    });
  }
  
  this.destroy = function() {}
};


gamejs.preload(['images/player.png']);
