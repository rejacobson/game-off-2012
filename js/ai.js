var FAILED = exports.FAILED = false;
var SUCCESS = exports.SUCCESS = true;
var RUNNING = exports.RUNNING = 2;

var BehaviourTree = exports.BehaviourTree = function(specs, context) {
  this.behaviours = [];
  var self = this;

  _.each(specs, function(spec, name) {
    if (_.isArray(spec)) {
      self.behaviours.push(new Behaviour(spec, context));
    } else if (_.isObject(spec)) {
      self.behaviours.push(new BehaviourTree(spec, context));
    }
  });
};

BehaviourTree.prototype.reset = function() {
  for (var i=0, len = this.behaviours.length; i<len; ++i) {
    this.behaviours[i].reset();
  };
};

BehaviourTree.prototype.update = function(msDuration) {
  var result;
  
  // Run each bevaviour until one returns SUCCESS or RUNNING
  // ie. Run the next behaviour if the current one has FAILED 
  for (var i=0, len = this.behaviours.length; i<len; ++i) {
    result = this.behaviours[i].update(msDuration);
    if (result != FAILED) break;
  }

  return result;
};


var Behaviour = function(actions, context) {
  this.context = context;
  this.actions = actions;
  this.running = 0;
};

Behaviour.prototype.reset = function() {
  this.running = 0;
};

Behaviour.prototype.update = function(msDuration) {
  var result;
  
  // Run each action until one returns FAILED or RUNNING
  // SUCCESS'ful actions run the next one in line
  for (var i = this.running, len = this.actions.length; i<len; ++i) {
    result = this.perform(this.actions[i]);

    switch (result) {
      case FAILED:
        this.running = 0;
        return FAILED;
        break;

      case RUNNING:
        this.running = i;
        return RUNNING;
        break;  

      case SUCCESS:
      default:
        break;
    }
  }

  this.running = 0;
  return SUCCESS;
};

Behaviour.prototype.perform = function(method_name) {
  if (!this.context.actions[method_name]) throw new Error('Character action not implemented: '+method_name);
  var args = Array.prototype.slice.call(arguments);
  args.shift();
  return this.context.actions[method_name].apply(this.context, args);
};

