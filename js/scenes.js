var gamejs = require('gamejs');
var levels = require('levels');
var gamescreen = require('gamescreen').instance();
var input = require('input');
var collision = require('collision');
var mob = require('mob');
var tree = require('tree');
var dialog = require('dialog');
var hud = require('hud');
var storage = require('storage');


function timeTaken(ms_start, ms_end) {
  var dt = Math.round((ms_end - ms_start) / 1000);
  
  return {
    total: dt,
    m: Math.floor(dt / 60),
    s: dt % 60
  }; 
};


function endOfGameTally(level, player, ms_start, ms_end) {
  var level_data = storage.getLevel(level),
      score = player.points.score(),
      time = timeTaken(ms_start, ms_end);

  return {
    points: score.points,
    multiplier: score.multiplier,
    time: time.m +'m '+ time.s +'s', 

    points_new_record: score.points > level_data.points,
    multiplier_new_record: score.multiplier > level_data.multiplier,
    time_new_record: time.total < level_data.time
  };
};

function scoreCard(level, player, ms_start, ms_end) {
  var score = endOfGameTally(level, player, ms_start, ms_end),
      source = $("#scorecard-template").html(),
      template = Handlebars.compile(source),
      html = template(score);

  $('#scorecard').html(html);   

  return score;
};

// Only save the better scores
function saveScoreCard(level, score) {
  if (!score.points_new_record) delete score.points;
  if (!score.multilplier_new_record) delete score.multiplier;
  if (!score.time_new_record) delete score.time;
  storage.saveLevel(level, score);
};

var GameScene = exports.GameScene = function(game, level_number) {
  dialog.hide();

  var input_router = new input.Router();
  var level = levels.load('level'+ level_number);
  var world = level.world;
  var collider = new collision.Resolver(world.entities);
  var status;
  var start_time = Date.now();

  // Player Controls
  world.player.controller = new input.Controller(world.player, mob.roster['hero'].keys, mob.roster['hero'].actions); 
  input_router.register(world.player.controller);

  this.handleEvent = input_router.handleEvent;

  /////////////////////////
  // Update
  /////////////////////////
  this.update = function(msDuration) {
    gamescreen.update(msDuration);

    input_router.update(msDuration);

    world.entities.update(msDuration);

    hud.update(msDuration, world.player); 
    
    // Collision detection
    collider.resolve();

    for (var i = 0, len = world.trees.length; i<len; ++i) {
      world.trees[i].update(msDuration);
    };

    if (status = level.finished()) {
      $(document).trigger('pause');
      var self = this;
      switch (status) {
        case 'win':
          var score = scoreCard(level_number, world.player, start_time, Date.now()),
              next_level_number = level_number + 1;

          // Save the score for this level
          saveScoreCard(level_number, score);
          
          // Unlock the next level
          storage.unlockLevel(next_level_number);

          dialog.show('win', {
            btnNextLevel: function(){
              game.stop();
              var scene = new GameScene(game, next_level_number);
              game.start(scene); 
            }, 
            btnLevels: function() {
              game.stop(); 
            } 
          });
          break;

        case 'lose':
          dialog.show('lose', {
            btnTryAgain: function(){
              game.stop();
              game.start(level_number);
            },

            btnLevels: function() {
              game.stop();
            }
          });
          break;
      }
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
  
  this.destroy = function() {
  }
};



var SplashScene = exports.SplashScene = function() {
  var worldsize = [1200, 2000],
      seed_at = [600, 1900],
      trunk,
      self = this;

  this.wakeup = function() {
    gamescreen.clear();
    gamescreen.levelSize(worldsize); 
    gamescreen.moveTo(trunk.leads[0].position);
    gamescreen.follow(trunk.leads[0]);
  }

  this.update = function(msDuration) {
    gamescreen.update(msDuration);
    trunk.update(msDuration);

    if (trunk.finished) {
      seed();
    }
  }

  this.draw = function() {
    trunk.draw(gamescreen.display('background'));
  }

  function seed() {
    trunk = new tree.Tree(seed_at.slice(0));
    self.wakeup();
  }

  seed();
};
