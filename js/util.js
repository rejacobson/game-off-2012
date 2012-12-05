var gamejs = require('gamejs');
var vectors = gamejs.utils.vectors;

exports.roll = function(max) {
  return Math.floor(Math.random() * max);
};

vectors.len_sq = function(v) {
  return v[0]*v[0] + v[1]*v[1];
};

vectors.distance_sq = function(a, b) {
  return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2);
};

vectors.leftNormal = function(v) {
  return [v[1], -v[0]];
};

vectors.rightNormal = function(v) {
  return [-v[1], v[0]];
};

vectors.toString = function(v) {
  return v[0]+':'+v[1];
};

vectors.round = function(v) {
  v[0] = Math.round(v[0]);
  v[1] = Math.round(v[1]);
  return v;
};

