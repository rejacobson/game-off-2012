var gamejs = require('gamejs');
var platforms = require('partitions/platforms');
var poles = require('partitions/poles');
var entities = require('partitions/entities');
var gamescreen = require('gamescreen').instance();
var tree = require('tree');
var mob = require('mob');


function create_partitions(worldsize) {
  return {
    platforms: new platforms.PlatformManager(worldsize[1], 20),
    poles: new poles.PoleManager(worldsize[0], 20),
    entities: new entities.EntityManager(worldsize, [16, 8])
  };  
}


/**
 * Levels
 */
var level = exports.level = {};

level[1] = {
  load: function() {
    var worldsize = [2000, 800],
        spawn_at = [800, 700],
        seed_at = [1000, 700],
        world = {},
        player = mob.factory(world, 'hero', {}, {position: spawn_at});

    _.extend(world, create_partitions(worldsize), {
      size: worldsize,
      player: player,
      trees: []
    });


    world.entities.insert(player);

    gamescreen.clear();
    gamescreen.levelSize(worldsize);
    //gamescreen.moveTo(seed_at);
    gamescreen.follow(player);

    // Insert base platform
    world.platforms.insert( new platforms.Platform(600, 1400, spawn_at[1], {fall_through: false}) );

    world.trees[0] = new tree.Tree(seed_at, {

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

          //
          // Randomly spawn a monster
          //
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

          //
          // Randomly spawn a monster
          //
        }
        
      }
    });
    
    return world;
  }
}
