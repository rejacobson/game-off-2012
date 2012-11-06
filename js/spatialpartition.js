var Grid = exports.Grid = function(settings) {
  var defaults = {
    map_size: [500, 500],
    cells: [10, 10],
    cell_size: [50, 50]
  };
  this.settings = _.extend(defaults, settings);
  
  this.settings.cell_size[0] = this.settings.map_size[0] / this.settings.cells[0];
  this.settings.cell_size[1] = this.settings.map_size[1] / this.settings.cells[1];

  this.map = [];
};

Grid.prototype.mapInsert = function(index, value) {
  this.map[index] = value;  
};

Grid.prototype.mapFetch = function(index, _default) {
  // Return multiple indices
  if (_.isArray(index)) {
    var self = this, list = [];
    _.each(index, function(i) {
      list = list.concat(self.map[i]);
    });
    return list;
  }
  
  if (_default && this.map[index] == undefined) this.mapInsert(index, _default);

  // Return a single index
  return this.map[index];
};

Grid.prototype.mapIndex = function(position) {
  var x = Math.floor(position[0] / this.settings.cell_size[0]),
      y = Math.floor(position[1] / this.settings.cell_size[1]);
      
  var index = (y * this.settings.cells[0]) + x;

  return index;
};

Grid.prototype.mapCoordinates = function(index) {
  var y = Math.floor(index / this.settings.cells[0]),
      x = Math.ceil(index / y) - this.settings.cells[0];
  return [x, y];
};

Grid.prototype.mapPosition = function(index) {
  var coords = this.mapCoordinates(index);
  return [coords[0] * this.settings.cell_size[0], coords[1] * this.settings.cell_size[1]];
};
