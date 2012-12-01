
var matrix = exports.matrix = (function(){
  var map = {}; 

  return {
    add: function(name, collides_with) {
      // Ensure an array is passed in
      if (!_.isArray(collides_with)) collides_with = [collides_with];

      // Create a new primary entry
      if (!map[name]) map[name] = {};

      // Add each name to the matrix
      _.each(collides_with, function(n) {
        map[name][n] = true;
      });
    },

    collidable: function(name, target) {
      return _.has(map, name) && (_.has(map[name], '*') || _.has(map[name], target)); 
    },

    get: function() {
      return map;
    }
  };
})();


var CollisionStats = function() {
  var tests = {};

  this.add = function(e1, e2) {
    var keys = this.keys(e1, e2);
    tests[keys[0]] = true;
    tests[keys[1]] = true;
  }

  this.tested = function(e1, e2) {
    var keys = this.keys(e1, e2);
    return _.has(tests, keys[0]) || _.has(tests, keys[1]);
  }

  this.keys = function(e1, e2) {
    return [
      e1.id +':'+ e2.id,
      e2.id +':'+ e1.id
    ];
  }

  this.reset = function() {
    tests = {};
  }
};


var Resolver = exports.Resolver = function(entities) {
  this.entities = entities;
  var stats = new CollisionStats();

  var e1, e2;

  this.resolve = function() {
    stats.reset();

    var self = this;

    _.each(self.entities.mapUsage(), function(count, index) {
      index = parseInt(index);

      var current = self.entities.mapFetch(index), 
          surrounding = self.entities.mapFetchSurrounding(index),
          current_size = current.length,
          combined = current.concat(surrounding);

      // Loop through each entity in current cell
      for (var i=0; i<current_size; ++i) {
        e1 = combined[i];

        if (!e1.interacting) continue;

        // Test against every other entity
        for (var j=i+1, jlen=combined.length; j<jlen; ++j) {
          e2 = combined[j];

          if (!e2.interacting || stats.tested(e1, e2)) continue;

          stats.add(e1, e2); 
          // Test e1 and e2
          if (e1.hitbox.collideRect(e2.hitbox)) {
/*
console.log(e1);
console.log(e2);
console.log('e1 interacting?: '+e1.interacting);
*/
            if (e1.collision && matrix.collidable(e1.name, e2.name) && e1.interacting) e1.collision(e2);
//console.log('e2 interacting?: '+e2.interacting);
            if (e2.collision && matrix.collidable(e2.name, e1.name) && e2.interacting) e2.collision(e1);
          }
        };
      };
    });

  } 

};

