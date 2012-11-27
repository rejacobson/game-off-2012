var scenes = require('scenes');
var storage = require('storage');

var _game, _callbacks = {};

exports.init = function(game) {
  _game = game;
};

var show = exports.show = function(name, callbacks) {
  var dialog = $('#'+ name);

  if (!dialog.length) return;

  hide();

  if (callbacks) {
    _callbacks[name] = callbacks;
  }

  return dialog.show();
};

var hide = exports.hide = function() {
  $('#gui .dialog').each(function(){
    var dialog = $(this),
        id = dialog.attr('id');

    if (_callbacks[id]) delete _callbacks[id];

    dialog.hide();
  });
};


// Setup the dialog behaviours
$(document).ready(function(){

  $('#gui .btn').click(function(){
    var current = $(this).closest('.dialog').attr('id'),
        name = $(this).attr('class').match(/btn(\w+)/)[1],
        id = 'btn'+ name, 
        dialog_to_open = name.toLowerCase();

    if (_callbacks[current] && _callbacks[current][id] && _.isFunction(_callbacks[current][id])) {
      _callbacks[current][id].call(this);
      delete _callbacks[current]; 
    }

    show(dialog_to_open);
  }); 

  // Set up the level tabs
  var source = $("#level-button-template").html(),
      template = Handlebars.compile(source),
      context, html; 
  
  for (var i=1; i<=16; ++i) {
    context = storage.getLevel(i); 
    html = template(context);
    $('#level-'+ i).html(html); 
  }

  // Level buttons
  $('#levels .levelButton').click(function(){
    var level = parseInt($(this).attr('id').replace('level-', '')),
        scene = new scenes.GameScene(_game, level);
    hide();
    _game.start(scene);
  });

});