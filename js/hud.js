var points = $('#points');
var multiplier = $('#multiplier');
var combo_meter = $('#combo_meter');
var meter = $('#meter').height(0).width(0);

var combo_meter_height = combo_meter.height();
var percentage;

exports.update = function(msDuration, player) {
  var stats = player.points.status();
  points.html(stats.points);
  multiplier.html('x'+ stats.multiplier);
  
  percentage = stats.remaining * 0.01 * combo_meter_height;
  meter.css({height: percentage, width: percentage, marginTop: (combo_meter_height - percentage) / 2});
};
