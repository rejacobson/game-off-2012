var Surface = require('gamejs').Surface;

var CANVASES = {};

var registerCanvas = exports.registerCanvas = function(id, dimensions) {
  var canvas = document.getElementById(id);

  if (canvas.tagName != 'CANVAS') {
    throw new Error('The id, '+ id +', is not a canvas element.');
  } 

  canvas.width = dimensions[0];
  canvas.height = dimensions[1];

  CANVASES[id] = { _canvas: canvas, _surface: null }; 
  return getSurface(id);
};

var getCanvas = exports.getCanvas = function(id) {
  return CANVASES[id]['_canvas'];
};

exports._getCanvasOffset = function(id) {
  var boundRect = getCanvas(id).getBoundingClientRect();
  return [boundRect.left, boundRect.top];
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
