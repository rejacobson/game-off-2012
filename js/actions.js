var entity = require('entity');

exports.Actions = {
  turn: function(msDuration, direction) {
    if (!direction) {
      this.face(this.facing * -1);
    } else {
      this.face(direction);   
    }
    
    return true;
  },

  walk: function(msDuration) {
    if (!this.on_ground) return false;

    this.animation.state('walk');
    this.stats.speed = this.base_stats.speed;

    return true;
  }, 

  run: function(msDuration) {
    if (!this.on_ground) return false;

    this.animation.state('walk');
    this.stats.speed = this.base_stats.speed * 3;

    return true;
  }, 

  move: function(msDuration) {
    if (this.pole) this.position[0] += 50 * msDuration * this.facing;

    if (this.on_ground) {
      this.velocity[entity.X] = this.stats.speed * this.facing;
    } else {
      this.position[entity.X] += 1 * this.facing;
    }

    return true;
  }, 

  move_up: function(msDuration){
    if (this.pole) {
      this.position[1] -= 75 * msDuration;
    } else {    
      this.pole = this.world.poles.findClosest(this.hitbox); 
      if (this.pole) {
        this.platform = null;
        this.velocity = [0, 0];
        this.on_ground = false;
      }
    }
  },
  
  move_down: function(msDuration){
    if (this.pole) {
      this.position[1] += 90 * msDuration;
    } else if (this.on_ground && this.platform && this.platform.settings.fall_through == true) {
      this.position[entity.Y] += 1;
      this.on_ground = false;
      this.platform = null;
    }
  },

  jump: function(msDuration){
    if (this.pole) {
      this.pole = null;
      this.velocity = [250 * this.facing, -200];
    }

    if (this.on_ground && this.platform) {
      this.platform = null;
      this.on_ground = false;
      this.velocity[entity.Y] = -450;
      //player.animation('jumping');
    }
  },
  
  idle: function(msDuration) {
    //player.animation('idle');
  },
  
  is_far_from_edge: function() {
    return !this.actions.is_near_edge.call(this);
  },

  is_near_edge: function() {
    if (!this.platform) return false;

    if (this.facing == -1) {
      return this.position[0] < this.platform.left + 20;
    } else {
      return this.position[0] > this.platform.right - 20;
    }
  }
}

