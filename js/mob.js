var entity = require('entity');
var animation = require('animation');
var ai = require('ai');
var collision = require('collision');

var roster = exports.roster = {
  'bloo': require('mob/bloo'),
  'buggaloo': require('mob/buggaloo'),
  'bunny': require('mob/bunny'),
  'gazer': require('mob/gazer'),
  'hero': require('mob/hero'),
  'mouth': require('mob/mouth'),
  'mouthball': require('mob/mouthball'),
  'snake': require('mob/snake'),
  'spiky': require('mob/spiky'),
  'toothface': require('mob/toothface')
};

_.each(roster, function(data, name) {
  if (data.collides_with) {
    collision.matrix.add(name, data.collides_with);
  }
});

exports.factory = function(world, name, _stats, _settings) {
  _stats = _stats || {};
  _settings = _settings || {};
  
  var mob = roster[name],
      stats = _.extend(mob.stats, _stats),
      settings = _.extend(mob.settings(), _settings);

  settings.animation = animation.Animation.factory(mob.animation);

  var creature = new entity.Creature(world, name, stats, settings);

  if (mob.actions) {
    creature.actions = mob.actions;
  }

  if (mob.behaviour) {
    creature.controller = new ai.BehaviourTree(mob.behaviour, creature);
    creature.on_update = function(msDuration) {
      this.controller.update(msDuration);
    };
  }
  
  return creature;      
};

