var gamejs = require('gamejs');

var Router = exports.Router = function() {
  // Actions are keypresses that only occur once
  var actions = {};
  
  // States are keypresses that occur while the key is still down.
  var states = {};

  var dbl = {};
    
  // Controllers map actions (entity method names), to key codes
  var controllers = [];

  var time, key;
  
  this.register = function(input_controller) {
    controllers.push(input_controller);
  }

  this.handleEvent = function(event) {
    key = event.key;

    // Get the time this press happened
    time = (new Date).getTime();
    
    // Keyup
    if (event.type === gamejs.event.KEY_UP) {
      delete actions[key];
      delete states[key];

      //////////////////////////////////////////////////
      if (dbl[key] == 1) {
        if (time - states[key+'_dbl'] > 200) {
          dbl[key] = 0;
          delete states[key+'_dbl'];
        } else {
          dbl[key] = 2;
        }
      } else if (dbl[key] == -1) {
        dbl[key] = 0;
        delete states[key+'_dbl'];
      }
      //////////////////////////////////////////////////
    } 
  
    // Keydown
    if (event.type === gamejs.event.KEY_DOWN) {
      if (!actions[key]) actions[key] = true;
      if (dbl[key] != -1) states[key] = true;

      //////////////////////////////////////////////////
      // First keypress.  
      if (!dbl[key]) {
        dbl[key] = 1;
        states[key+'_dbl'] = time;

      } else if (dbl[key] != -1) {
        // 2 == After a keyup event
        if (dbl[key] == 2) {

          // Time is within bounds -- double tap is good!
          if (time - states[key+'_dbl'] < 200) {
            dbl[key] = -1;
            states[key+'_dbl'] = true;
            delete states[key];

          // Too late -- count it as the first keydown
          } else {
            dbl[key] = 1;
            states[key+'_dbl'] = time;
          }
        } else {
          dbl[key] = -1;
        }
      }
      //////////////////////////////////////////////////
    }
  }
  
  this.update = function(msDuration) {
    if (controllers.length <= 0) return;
    
    for (key in states) {
      if (states[key] !== true) continue;
      key = key+'_hold';
      
      _.each(controllers, function(c) {
        if (c.implements(key)) {
          c.execute(key, msDuration, states);
        }
      });
    }

    for (key in actions) {
      if (actions[key] === -1) continue;
      actions[key] = -1;

      _.each(controllers, function(c) {
        if (c.implements(key)) {
          c.execute(key, msDuration, states);
        }
      });
    }
  }

};

var Controller = exports.Controller = function(entity, actionMap) {
  if (!entity.actions) throw new Error('input.Controller -- Entity does not have any actions');

  var entity = entity;
  var actionMap = actionMap;
  var actions = entity.actions;
  
  this.implements = function(key) {
    return !!actionMap[key];
  }
  
  this.execute = function(key, msDuration, key_states) {
    _.each(actionMap[key], function(func) {
      var args = func.split(' '), 
          func = args.shift();
          
      args.unshift(msDuration);

      if (actions[func]) {
        actions[func].apply(entity, args);
      }
    });
  }
};
