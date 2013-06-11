var globals;
if (typeof require !== "undefined") {
  globals = require("./globals");
} else {
  globals = Pucko.globals;
}
(function() {
  function Player(options) {
    this.id = options.id;
    this.team = options.team;
    this.local = options.local || false;
    this.serverEvents = options.serverEvents || null;

    this.moving = {
      left: false,
      right: false,
      up: false,
      down: false
    };

    this.shooting = false;
    this.blocking = false;

    this.speed = 120;
    this.dx = 0;
    this.dy = 0;
    this.acc = 0.4;
    this.x = options.x || globals.width / 2 + (this.team === 0 ? -150 : 150);
    this.y = options.y || globals.height / 2;

    if (typeof module === "undefined") {
      this.clientInit();
    } else {
      this.serverInit();
    }
  }

  Player.prototype.clientInit = function() {
    this.texture = PIXI.Texture
      .fromImage("public/images/bunny" + (this.team + 1) + ".png");
    this.sprite = new PIXI.Sprite(this.texture);

    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;

    this.sprite.position.x = this.x;
    this.sprite.position.y = this.y;

    Pucko.stage.addChild(this.sprite);

    var player = this;
    Pucko.$.on("beforeRender." + this.id, function(e, data) {
      player.update(data.delta);
      player.render();
    });

    if (this.local) {
      this.localInit();
    } else {
      this.remoteInit();
    }
  }

  Player.prototype.clientRemove = function() {
    Pucko.stage.removeChild(this.sprite);
    Pucko.$.off("beforeRender." + this.id);
  }

  Player.prototype.serverInit = function() {
  };

  Player.prototype.serverOnPlayerUpdate = function(data) {
      if (data.id !== this.id) return;
      this.deserialize(data);
      if (this.shooting) {
        this.serverEvents.emit("playerShoot", this.serialize());
        this.shooting = false;
      }
  }

  Player.prototype.serverRemove = function() {
  };

  Player.prototype.localInit = function() {
    var player = this;
    var circle = new PIXI.Sprite(PIXI.Texture
      .fromImage("public/images/circle.png"));
    circle.position.x = -15;
    circle.position.y = -5;
    circle.alpha = 0.5;

    this.sprite.addChildAt(circle, 0);
    $(document).on({
      "keydown": function(e) {
        handler = keyDownEvents[e.keyCode];
        if (handler) {
          handler();
        }
      },
      "keyup": function(e) {
        handler = keyUpEvents[e.keyCode];
        if (handler) {
          handler();
        }
      }
    });

    Pucko.sync.trigger("playerConnected", player.serialize());
  };

  Player.prototype.remoteInit = function() {
    Pucko.sync.on("playerUpdate", function(e, data) {
      var player = Pucko.players[data.id];
      player.x = data.x;
      player.y = data.y;
    });
  };

  Player.prototype.update = function(delta) {
    var secondsDelta = delta / 1000,
        prevX = this.x,
        prevY = this.y,
        speed = this.speed,
        acc = this.acc;


    if ((this.moving.up || this.moving.down) &&
        (this.moving.left || this.moving.right)) {
      speed = Math.sqrt(speed * speed / 2);
      acc = Math.sqrt(acc * acc / 2);
    }

    if (this.moving.left) {
      if(this.dx > -speed){
        this.dx -= acc;
      } else {
        this.dx = -speed;
      }
    }

    if (this.moving.right) {
      if(this.dx < speed){
        this.dx += acc;
      } else {
        this.dx = speed;
      }
    }

    if (this.moving.up) {
      if(this.dy > -speed){
        this.dy -= acc;
      } else {
        this.dy = -speed;
      }

    }

    if (this.moving.down) {
      if(this.dy < speed){
        this.dy += acc;
      } else {
        this.dy = speed;
      }
    }

    this.x += this.dx;
    this.y += this.dy;
    if(this.x + this.texture.width/2 >= Pucko.globals.width) {
      this.x = Pucko.globals.width - this.texture.width/2;

      this.dx *= -1;
    }
    if(this.x <= 0 + this.texture.width/2){
      this.x = 0 + this.texture.width/2;
      this.dx *= -1;
    }
    if(this.y + this.texture.height/2 >= Pucko.globals.height){
      this.y = Pucko.globals.height - this.texture.height/2;
      this.dy *= -1;
    }
    if(this.y <= 0 + this.texture.height/2){
      this.y = 0 + this.texture.height/2;
      this.dy *= -1;
    }

    this.dx *= globals.friction;
    this.dy *= globals.friction;


    if (prevX != this.x || prevY != this.y)
      Pucko.sync.trigger("playerUpdate", this.serialize());

    if (this.blocking) {
      this.dx *= globals.blockingFriction;
      this.dy *= globals.blockingFriction;
    }

    this.shooting = false;
  }

  Player.prototype.render = function() {
    this.sprite.position.x = this.x;
    this.sprite.position.y = this.y;
  }

  Player.prototype.serialize = function() {
    return {
      id: this.id,
      team: this.team,
      x: this.x,
      y: this.y,
      dx: this.dx,
      dy: this.dy,
      blocking: this.blocking,
      shooting: this.shooting
    };
  }

  Player.prototype.deserialize = function(properties) {
    this.team = properties.team;
    this.x = properties.x;
    this.y = properties.y;
    this.dx = properties.dx;
    this.dy = properties.dy;
    this.blocking = properties.blocking;
    this.shooting = properties.shooting;
  }

  var keyDownEvents = {
    "37": function() { Pucko.localPlayer.moving.left = true; },
    "65": function() { Pucko.localPlayer.moving.left = true; },
    "39": function() { Pucko.localPlayer.moving.right = true; },
    "68": function() { Pucko.localPlayer.moving.right = true; },
    "40": function() { Pucko.localPlayer.moving.down = true; },
    "83": function() { Pucko.localPlayer.moving.down = true; },
    "38": function() { Pucko.localPlayer.moving.up = true; },
    "87": function() { Pucko.localPlayer.moving.up = true; },

    "32": function() {
      Pucko.localPlayer.blocking = true;
      Pucko.localPlayer.shooting = true;
    }
  }

  var keyUpEvents = {
    "37": function() { Pucko.localPlayer.moving.left = false; },
    "65": function() { Pucko.localPlayer.moving.left = false; },
    "39": function() { Pucko.localPlayer.moving.right = false; },
    "68": function() { Pucko.localPlayer.moving.right = false; },
    "40": function() { Pucko.localPlayer.moving.down = false; },
    "83": function() { Pucko.localPlayer.moving.down = false; },
    "38": function() { Pucko.localPlayer.moving.up = false; },
    "87": function() { Pucko.localPlayer.moving.up = false; },
    "32": function() {
      Pucko.localPlayer.blocking = false;
      Pucko.localPlayer.shooting = false;
    }
  }

  if (typeof module !== "undefined") {
    module.exports = Player;
  } else {
    Pucko.Player = Player;
  }
})();