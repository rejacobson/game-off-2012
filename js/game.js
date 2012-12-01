var gamejs = require('gamejs');
var gamescreen = require('gamescreen').instance();
var scenes = require('scenes');
var srand = require('srand');

var requestAnimationFrame = (function(){
  //Check for each browser
  //@paul_irish function
  //Globalises this function to work on any browser as each browser has a different namespace for this
  try{
    window;
  } catch(e){
    return;
  }
  
  return window.requestAnimationFrame || //Chromium
         window.webkitRequestAnimationFrame || //Webkit
         window.mozRequestAnimationFrame || //Mozilla Geko
         window.oRequestAnimationFrame || //Opera Presto
         window.msRequestAnimationFrame || //IE Trident?
         function(callback, element) { //Fallback function
           window.setTimeout(callback, 1000/settings.get('FPS'));
         }
     
})();

var pageHiddenProperty = (function(){
  var prefixes = ['webkit','moz','ms','o'];
  
  // if 'hidden' is natively supported just return it
  if ('hidden' in document) return 'hidden';
  
  // otherwise loop over all the known prefixes until we find one
  for (var i = 0; i < prefixes.length; i++){
    if ((prefixes[i] + 'Hidden') in document) return prefixes[i] + 'Hidden';
  }

  // otherwise it's not supported
  return null;
})();

function pageIsHidden() {
  if (!pageHiddenProperty) return false;
  return document[pageHiddenProperty];
};

function onVisibilityChange(hidden_callback, visible_callback) {
  if (pageHiddenProperty) {
    var eventname = pageHiddenProperty.replace(/[H|h]idden/, '') + 'visibilitychange';
    document.addEventListener(eventname, function(event){
      if (pageIsHidden()) {
        if (hidden_callback && _.isFunction(hidden_callback)) hidden_callback(event);
      } else {
        if (visible_callback && _.isFunction(visible_callback)) visible_callback(event);
      }
    });
  }
};


var Director = exports.Director = function() {
  var activeScene = null,
      scenes = [],
      t,
      last_t,
      msDuration,
      paused = false;

  function tick(t){
    t = t || (new Date()).getTime();
    msDuration = t - last_t;
    last_t = t;

    msDuration = msDuration * 0.001;

    if (activeScene){
      tick_logic(msDuration);
      tick_render(msDuration);
    }

    if (!paused) requestAnimationFrame(tick);
  }

  function pause() {
    paused = true;
  }

  function unpause() {
    paused = false;
    last_t = (new Date()).getTime() - msDuration;
    tick();
  }

  onVisibilityChange(pause, unpause);
  $(document).on('pause', pause);
  $(document).on('unpause', unpause);

  function tick_logic(msDuration){
    if (activeScene.handleEvent) {
      var evts = gamejs.event.get();
      var i;
      for (i=0; i<evts.length; i++){
        activeScene.handleEvent(evts[i]);
      }
    } else {
      // throw all events away
      gamejs.event.get();
    }
    if (activeScene.update) activeScene.update(msDuration);
  }

  function tick_render(msDuration){
    if (activeScene.draw) activeScene.draw();
  }

  this.getScene = function() {
    return activeScene;
  };

  this.pushScene = function(scene) {
    scenes.push(scene);
    activeScene = scene;
  };

  this.popScene = function() {
console.log('Popping scene');
console.log(scenes);
    var s = scenes.pop();
console.log('POP');
console.log(s);
console.log(scenes);
    if (s.destroy) s.destroy();
    activeScene = scenes[scenes.length-1];

    if (activeScene.wakeup) activeScene.wakeup();
console.log('active scene == ');
console.log(activeScene);
  };
  
  //gamejs.time.fpsCallback(tick, this, 60);
  tick(0);
  
  return this;
};

exports.init = function() {
  var game = new Game();
  return game;
}

var Game = exports.Game = function() {
  this.director = new Director();

  this.start = function(scene){
    if (!scene) scene = new scenes.SplashScene();
    this.director.pushScene(scene);
  };

  this.stop = function() {
    this.director.popScene(); 
    gamescreen.clear();
    $(document).trigger('unpause');
  };
};
