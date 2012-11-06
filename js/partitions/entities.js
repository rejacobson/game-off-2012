var gamejs = require('gamejs');
var spatialpartition = require('spatialpartition');

var EntityManager = exports.EntityManager = function(map_size, cells) {
  if (!_.isArray(map_size) || map_size.length != 2) throw new Error('EntityManager map_size must be a 2 element array: [width, height]');
  if (!_.isArray(cells) || cells.length != 2) throw new Error('EntityManager cells must be a 2 element array: [num_cells_wide, num_cells_high]');

  spatialpartition.Grid.call(this, {
    map_size: map_size,
    cells: cells
  });

  this.entities = [];
};
EntityManager.prototype = Object.create(spatialpartition.Grid.prototype);

EntityManager.prototype.insert = function(entity) {
  this.entities.push(entity);
  this.reindex(entity);
  entity._map_index = this.entities.length - 1;
};

EntityManager.prototype.remove = function(entity) {
  var index = this.mapIndex(entity.position),
      cell = this.mapFetch(index);

  this.entities.splice(entity._map_index, 1);
  
  for (var i=0; i<cell.length; ++i) {
    if (cell[i] == entity) {
      cell.splice(i, 1);
      break;
    }
  }
};

EntityManager.prototype.reindex = function(entity) {
  var index = this.mapIndex(entity.position),
      cell = this.mapFetch(index, []);

  if (entity.cellIndex && entity.cellIndex != index) {
    var old_cell = this.mapFetch(entity.cellIndex);
    for (var i=0; i<old_cell.length; ++i) {
      if (old_cell[i] == entity) {
        old_cell.splice(i, 1);
        break; 
      }
    }
  } 

  entity._cell_index = index;
  cell.push(entity); 
};


var e;

EntityManager.prototype.update = function(msDuration) {
  for (var i=0, len = this.entities.length; i<len; ++i) {
    e = this.entities[i]; 
    if (e.update) e.update(msDuration);
  }
};

EntityManager.prototype.draw = function(display) {
  for (var i=0, len = this.entities.length; i<len; ++i) {
    e = this.entities[i]; 
    if (e.draw) e.draw(display);
  }
};
