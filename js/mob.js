var entity = require('entity');
var animation = require('animation');
var ai = require('ai');

var roster = exports.roster = {
  'hero': require('mob/hero'),
  'toothface': require('mob/toothface')
};

exports.factory = function(world, name, _stats, _settings) {
  _stats = _stats || {};
  _settings = _settings || {};
  
  var mob = roster[name],
      stats = _.extend(mob.stats, _stats),
      settings = _.extend(mob.settings, _settings);

  settings.animation = animation.Animation.factory(mob.animation);

  var creature = new entity.Creature(world, name, stats, settings);

  if (mob.behaviour) {
    creature.controller = new ai.BehaviourTree(mob.behaviour, creature);
    creature.update_callback = function(msDuration) {
      this.controller.update(msDuration);
    };
    creature.actions = Actions;
  }
  
  return creature;      
};


var Actions = {
  'turn': function(direction) {
    if (!direction) {
      this.face(this.facing * -1);
    } else {
      this.face(direction);   
    }
    
    return true;
  },

  'is_far_from_edge': function() {
    return !this.actions.is_near_edge();
  },

  'is_near_edge': function() {
    if (!this.platform) return false;

    if (this.facing == -1) {
      return this.position[0] < this.platform.left + 10;
    } else {
      return this.position[0] > this.platform.right - 10;
    }
  },

  'walk': function() {
    this.velocity[0] = this.stats.speed * this.facing;
    return true;
  }
};

