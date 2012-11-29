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
var srand = require('srand');


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
  var trunk,
      self = this,
      view_time = 0,
      current_demo;

  var demos = [
    { worldsize: [1800, 2000],
      seed_at: [900, 1900],
      type: 'Oak',
      view_time: 8
    },

    { worldsize: [1400, 3400],
      seed_at: [700, 3300],
      type: 'Pine',
      view_time: null
    },

    { worldsize: [2400, 900],
      seed_at: [1200, 850],
      type: 'Willow',
      view_time: 4
    },

    { worldsize: [1400, 2000],
      seed_at: [700, 400],
      type: 'Down',
      view_time: null
    },

    { worldsize: [1200, 700],
      seed_at: [600, 500],
      type: 'Bonzai',
      settings: {
        max_steps: 100 
      },
      view_time: null
    }
  ];

  function pick_demo() {
    var index = srand.random.range(demos.length - 1);
    return demos[index];
  }

  function load_demo(demo) {
    current_demo = demo;
    trunk = new tree[current_demo.type](current_demo.seed_at, current_demo.settings || {});
    self.wakeup();
  }

  this.wakeup = function() {
    gamescreen.clear();
    gamescreen.levelSize(current_demo.worldsize); 
    gamescreen.moveTo(trunk.branches()[0].position);
    gamescreen.follow(trunk.branches()[0]);
  }

  this.update = function(msDuration) {
    view_time += msDuration;

    if (current_demo.view_time && view_time > current_demo.view_time) {
      gamescreen.follow(trunk.getLastBranch());
      view_time = 0;
    }

    gamescreen.update(msDuration);
    trunk.update(msDuration);

    if (trunk.finished()) {
      load_demo(pick_demo());
    }
  }

  this.draw = function() {
    trunk.draw(gamescreen.display('background'));
    //gamescreen.display('main').clear();
    //gamescreen.draw(gamescreen.display('main'));
  }

  load_demo(pick_demo());
};
