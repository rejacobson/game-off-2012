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
  var index = this.mapIndex(entity.position);
  this.entities.push(entity);
  this.reindex(index, entity);
  entity._map_index = this.entities.length - 1;
};

EntityManager.prototype.remove = function(entity) {
  var index = this.mapIndex(entity.position),
      cell = this.mapFetch(index);

  this.entities.splice(entity._map_index, 1);
  
  this.mapRemove(index, entity);
};

EntityManager.prototype.reindex = function(index, entity) {
  if (index == entity._cell_index) return;
  
  if (entity._cell_index) {
    this.mapRemove(entity._cell_index, entity);
  }

  entity._cell_index = index;
  this.mapFetch(index, []).push(entity); 
};

var e, new_index, rect = new gamejs.Rect([0, 0], [0, 0]);

EntityManager.prototype.update = function(msDuration) {
  for (var i=0, len = this.entities.length; i<len; ++i) {
    e = this.entities[i]; 
    if (e._cell_index != (new_index = this.mapIndex(e.position))) this.reindex(new_index, e);
    if (e.update) e.update(msDuration);
  }
};

EntityManager.prototype.draw = function(display) {
  for (var i=0, len = this.entities.length; i<len; ++i) {
    e = this.entities[i]; 
    if (e.draw) e.draw(display); 

    rect.width = this.settings.cell_size[0];
    rect.height = this.settings.cell_size[1];
    rect.topleft = this.mapPosition(e._cell_index);
    gamejs.draw.rect(display, '#00ffff', rect, 1);
  }
};
