var settings = exports.settings = {
  SCREEN_WIDTH: 1200,  //screen width in pixels
  SCREEN_HEIGHT: 600, //screen height in pixels
  FPS: 60,        //logic updates per second
  DEBUG: true,
};

exports.get=function(name){
    return settings[name];
};

exports.init=function(){
    for(var key in settings){
        if(window.hasOwnProperty(key)){
            settings[key]=window[key];
        }
    }
};

exports.set=function(name, value){
    settings[name]=value;
};
