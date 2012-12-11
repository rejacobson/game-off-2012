var ComboMeter = function(msMaxTime) {
  var expires_at = null;
  var multiplier = 1;
  var best_multiplier = multiplier;
  
  _.extend(this, {
  
    accumulate: function() {
      expires_at = Date.now() + msMaxTime;
      multiplier++;

      if (multiplier > best_multiplier) best_multiplier = multiplier;
    },
    
    reset: function() {
      expires_at = null;
      multiplier = 1;
    },
    
    // Return the time remaining in the combo as a percentage
    remaining: function() {
      var dt = expires_at - Date.now();
      if (dt < 0) return 0;
      return Math.round(dt / msMaxTime * 100);
    },
    
    multiplier: function() {
      if (expires_at && this.remaining() <= 0) this.reset();
      return multiplier;
    },

    bestMultiplier: function() {
      return best_multiplier;
    }
    
  });
};
  
var Counter = exports.Counter = function() {
  var combo = new ComboMeter(4000); // 4 seconds
  var points = 0;
  
  _.extend(this, {
  
    add: function(amount) {
      var n = amount * combo.multiplier();
      points += n;
      combo.accumulate();
      return n;
    },
    
    total: function() {
      return points;
    },

    status: function() {
      return {
        points: this.total(),
        multiplier: combo.multiplier(),
        remaining: combo.remaining()
      };
    },

    score: function() {
      return {
        points: points,
        multiplier: combo.bestMultiplier()
      };
    }
    
  });
};
