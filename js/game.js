var gamejs = require('gamejs');
var scenes = require('scenes');

var requestAnimationFrame=(function(){
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
            function(callback, element){ //Fallback function
                window.setTimeout(callback, 1000/settings.get('FPS'));
            }
     
})();

var Director = exports.Director = function(displays) {
  var onAir = false;
  var activeScene = null;
  var last_t;

  function tick(t){
    t=t || (new Date()).getTime();
    msDuration=t-last_t;
    last_t=t;

    msDuration = msDuration*0.001;

    if (activeScene){
      tick_logic(msDuration);
      tick_render(msDuration);
    }
    requestAnimationFrame(tick);
  }

  function tick_logic(msDuration){
    if (!onAir) return;
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
    if (activeScene.draw) activeScene.draw(displays, msDuration);
  }

  this.start = function(scene) {
    onAir = true;
    this.replaceScene(scene);
    return;
  };

  this.replaceScene = function(scene) {
    if (activeScene && activeScene.destroy) activeScene.destroy(); 
    activeScene = scene;
  };

  this.getScene = function() {
    return activeScene;
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
  this.director = null;
  this.player = null;
  this.displays = null;

  this.start = function(displays){
    this.displays = displays;
    this.director = new Director(displays);
    this.game_scene = new scenes.GameScene(this);
    this.director.start(this.game_scene);
    //this.playLevel(levels.drycircuit, false, true);
  };
};
