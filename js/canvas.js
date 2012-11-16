var Surface = require('gamejs').Surface;

var CANVASES = {};

var registerCanvas = exports.registerCanvas = function(id, size) {
  var canvas = document.getElementById(id);

  if (canvas.tagName != 'CANVAS') {
    throw new Error('The id, '+ id +', is not a canvas element.');
  } 

  CANVASES[id] = { _canvas: canvas, _surface: null }; 

  return resizeCanvas(id, size);
};

var resizeCanvas = exports.resizeCanvas = function(id, size) {
  var canvas = getCanvas(id);
  canvas.width = size[0];
  canvas.height = size[1];
  CANVASES[id]['_surface'] = null;
  return getSurface(id);
};

/**
 * The Display (the canvas element) is most likely not in the top left corner
 * of the browser due to CSS styling. To calculate the mouseposition within the
 * canvas we need this offset.
 * @see {gamejs.event}
 * @ignore
 *
 * @returns {Array} [x, y] offset of the canvas
 */
exports._getCanvasOffset = function(id) {
  var boundRect = getCanvas(id).getBoundingClientRect();
  return [boundRect.left, boundRect.top];
};

var getCanvas = exports.getCanvas = function(id) {
  return CANVASES[id]['_canvas'];
};

/**
 * Drawing on the Surface returned by `getSurface()` will draw on the screen.
 * @returns {gamejs.Surface} the display Surface
 */
var getSurface = exports.getSurface = function(id) {
  if (CANVASES[id]['_surface'] === null) {
    var canvas = getCanvas(id);
    var surface = new Surface([canvas.clientWidth, canvas.clientHeight]);
    surface._canvas = canvas;
    surface._context = canvas.getContext('2d');
    surface._smooth();
    CANVASES[id]['_surface'] = surface;
  }

  return CANVASES[id]['_surface'];
};
