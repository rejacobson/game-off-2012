
var Grid = exports.Grid = function(mapsize, cellsize) {
  var cell_count_x = Math.round(mapsize[0] / cellsize[0]),
      cell_count_y = Math.round(mapsize[1] / cellsize[1]);

  this.mapsize = mapsize;
  this.cellsize = [mapsize[0] / cell_count_x, mapsize[1] / cell_count_y];
  this.cellcount = [cell_count_x, cell_count_y];

  this.max = this.cellcount[0] * this.cellcount[1] - 1;

  this.memo = {};
  
  this.map = [];
};

Grid.prototype.mapPush = function(index, value) {
  var cell = this.mapFetch(index, []);
  cell.push(value);
  if (!this.memo[index]) this.memo[index] = 0;
  this.memo[index]++;
};

Grid.prototype.mapRemove = function(index, value) {
  var cell = this.mapFetch(index);

  for (var i=0; i<cell.length; ++i) {
    if (cell[i] == value) {
      cell.splice(i, 1);
      this.memo[index]--;
      if (this.memo[index] <= 0) delete this.memo[index];
      break;
    }
  }

  return value;
};

Grid.prototype.mapUsage = function() {
  return this.memo;
};

// Get the contents of a cell by it's index
Grid.prototype.mapFetch = function(index, _default) {
  // Return multiple indices
  if (_.isArray(index)) {
    var list = [], cell;
    for (var i=0, len=index.length; i<len; ++i) {
      cell = index[i];
      if (this.map[cell] && this.map[cell].length) {
        list = list.concat(this.map[cell]);
      }
    };
    return list;
  }
  
  if (_default && this.map[index] == undefined) this.map[index] = _default;

  // Return a single index
  return this.map[index];
};

// Get the contents of all cells surrounding the cell at index
Grid.prototype.mapFetchSurrounding = function(index) {
  return this.mapFetch(this.mapSurrounding(index));
};

Grid.prototype.mapSurrounding = function(index) {
  var indices = [],
      coords = this.mapCoordinates(index),
      x = coords[0],
      y = coords[1],
      width = this.cellcount[0],
      height = this.cellcount[1];

  // X is not touching left hand side
  if (x > 1) {
    indices.push(index - 1); // WEST
    
    if (y > 1) indices.push(index - width - 1); // NORTH WEST
    if (y < height - 1) indices.push(index + width - 1); // SOUTH WEST
  }

  // X is not touching the right hand side
  if (x < width - 1) {
    indices.push(index + 1); // EAST
   
    if (y > 1) indices.push(index - width + 1); // NORTH EAST
    if (y < height - 1) indices.push(index + width + 1); // SOUTH EAST
  }

  // Y is not touching the top
  if (y > 1) indices.push(index - width); // NORTH

  // Y is not touching the bottom
  if (y < height - 1) indices.push(index + width); // SOUTH
  
  return indices;
};

Grid.prototype.mapIndex = function(position) {
  var x = Math.floor(position[0] / this.cellsize[0]),
      y = Math.floor(position[1] / this.cellsize[1]);
      
  var index = (y * this.cellcount[0]) + x;

  return index;
};

Grid.prototype.mapCoordinates = function(index) {
  var y = Math.floor(index / this.cellcount[0]),
      x = index - (y * this.cellcount[0]);
  return [x, y];
};

Grid.prototype.mapPosition = function(index) {
  var coords = this.mapCoordinates(index);
  return [coords[0] * this.cellsize[0], coords[1] * this.cellsize[1]];
};
