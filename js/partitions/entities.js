var gamejs = require('gamejs');
var spatialpartition = require('spatialpartition');

var EntityManager = exports.EntityManager = function(map_size, cells) {
  spatialpartition.Grid.call(this, {
    map_size: map_size,
    cells: cells
  });

  this.entities = [];
};
EntityManager.prototype = Object.create(spatialpartition.Grid.prototype);

