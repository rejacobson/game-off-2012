var scenes = require('scenes');

var _game;

exports.init = function(game) {
  _game = game;
};

var show = exports.show = function(id) {
  hide();
  return $('#'+ id).show();
};

var hide = exports.hide = function() {
  $('#gui .dialog').hide();
};


// Setup the dialog behaviours
$(document).ready(function(){
console.log('Creating button behaviours');

  // Splash Screen button 
  $('.btnSplash').click(function(){
    show('splash');
    return false;
  });
  
  // Instructions Screen button 
  $('.btnInstructions').click(function(){
    show('instructions');
    return false;
  });
  
  // Level Select button
  $('.btnLevels').click(function(){
    show('levels');
    return false;
  });

  // Level buttons
  $('#levels a.level').click(function(){
    var level = $(this).attr('id'),
        scene = new scenes.GameScene(level);
    hide();
    _game.start(scene);
  });

});
