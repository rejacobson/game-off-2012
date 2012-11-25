var gamejs = require('gamejs');
var spatialpartition = require('spatialpartition');

var EntityManager = exports.EntityManager = function(mapsize, cellsize, options) {
  if (!_.isArray(mapsize) || mapsize.length != 2) throw new Error('EntityManager map_size must be a 2 element array: [width, height]');
  if (!_.isArray(cellsize) || cellsize.length != 2) throw new Error('EntityManager cells must be a 2 element array: [cell_width, cell_height]');

  spatialpartition.Grid.call(this, mapsize, cellsize);

  _options = _.extend({
    insert: null,
    remove: null
  }, options);

  _entities = [];
  _size = 0;


  _.extend(this, {

    // Return the number of active entities in the system
    size: function() {
      return _size;
    },

    get: function() {
      return _.compact(_entities);
    },

    // Insert a new entity
    insert: function(entity) {
      var cell_index = this.mapIndex(entity.position);
     
      _entities.push(entity);

      _size++;

      this.reindex(cell_index, entity);

      var fn = _options.insert;
      if (fn && _.isFunction(fn)) fn.call(this, entity);
    },

    // Remove an entity
    remove: function(entity) {
      if (entity._cell_index) this.mapRemove(entity._cell_index, entity);

      var fn = _options.remove;
      if (fn && _.isFunction(fn)) fn.call(this, entity);

      var i = _.indexOf(_entities, entity);
      if (-1 != i) {
        _entities[i] = undefined;
      }

      _size--;

      delete entity._cell_index;

      entity.alive = false;
    },

    // Reposition the entity within the spatial partition
    reindex: function(index, entity) {
      if (index == entity._cell_index) return;
      
      if (entity._cell_index) {
        this.mapRemove(entity._cell_index, entity);
      }

      entity._cell_index = index;
      this.mapPush(index, entity);
    },

    // Execute a function for each entity in the system
    eachEntity: function(func) {
      for (var i=0, len = _entities.length; i<len; ++i) {
        if (!_entities[i]) continue;
        if (false === func.call(this, _entities[i], i)) break;
      }
    },


    // Update all entities
    update: function(msDuration) {
      var e, new_index, dead = [];

      this.eachEntity(function(e) {
        if (e.update) e.update(msDuration);

        new_index = this.mapIndex(e.position);
        if (null === new_index) {
          dead.push(e);
        } else if (e._cell_index != new_index) {
          this.reindex(new_index, e);
        }
      });

      if (dead.length) {
        for (var i=0, len=dead.length; i<len; ++i) {
          this.remove(dead[i]);
        }
      }
    },

    // Draw all entities
    draw: function(display) {
      this.eachEntity(function(e) {
        if (e.draw) e.draw(display); 

    /*
        var rect = new gamejs.Rect([0, 0], [0, 0]);

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
      });
    }
  });
  
};
EntityManager.prototype = Object.create(spatialpartition.Grid.prototype);

