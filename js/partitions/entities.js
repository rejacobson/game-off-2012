var gamejs = require('gamejs');
var spatialpartition = require('spatialpartition');

var EntityManager = exports.EntityManager = function(mapsize, cellsize) {
  if (!_.isArray(mapsize) || mapsize.length != 2) throw new Error('EntityManager map_size must be a 2 element array: [width, height]');
  if (!_.isArray(cellsize) || cellsize.length != 2) throw new Error('EntityManager cells must be a 2 element array: [cell_width, cell_height]');

  spatialpartition.Grid.call(this, mapsize, cellsize);

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
  this.entities.splice(entity._map_index, 1);
  if (entity._cell_index) this.mapRemove(entity._cell_index, entity);
};

EntityManager.prototype.reindex = function(index, entity) {
  if (index == entity._cell_index) return;
  
  if (entity._cell_index) {
    this.mapRemove(entity._cell_index, entity);
  }

  entity._cell_index = index;
  this.mapPush(index, entity);
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

/*
    // Draw the cells surrounding the entity
    cells = this.mapSurrounding(e._cell_index);
    rect.width = this.cellsize[0];
    rect.height = this.cellsize[1];
    var self = this;
    _.each(cells, function(c) {
      rect.topleft = self.mapPosition(c);
      gamejs.draw.rect(display, '#ff00ff', rect, 1);
    });

    // Draw the cell the entity belongs to
    rect.topleft = this.mapPosition(e._cell_index);
    gamejs.draw.rect(display, '#00ffff', rect, 1);
*/
  }
};
