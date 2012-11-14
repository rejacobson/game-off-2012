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

  if (mob.actions) {
    creature.actions = mob.actions;
  }

  if (mob.behaviour) {
    creature.controller = new ai.BehaviourTree(mob.behaviour, creature);
    creature.update_callback = function(msDuration) {
      this.controller.update(msDuration);
    };
  }
  
  return creature;      
};

