function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

if (!supports_html5_storage) throw new Error('Your browser does not support html5 localStorage!');

var _default = {
  level: 0,
  locked: 'locked',
  points: 0,
  multiplier: 0,
  time: 0
};

var getLevel = exports.getLevel = function(level) {
  var data = localStorage.getItem('levels.'+ level);
  
  if (!data) {
    data = _.extend({}, _default, {level: level});
  } else {
    data = JSON.parse(data);
  }

  return data;
};

var setLevel = exports.setLevel = function(level, data) {
  var existing = getLevel(level);

  data = _.pick(data, _.keys(_default));

  data.level = level;
  data = _.extend(existing, data);
  data = JSON.stringify(data);

  localStorage.setItem('levels.'+ level, data);
};


if (getLevel(1).locked == 'locked') {
  setLevel(1, {locked: ''});
}
