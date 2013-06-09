(function() {
  function Player(options) {
    this.id = options.id;
    this.local = options.local || false;
    this.serverEvents = options.serverEvents || null;

    this.moving = {
      left: false,
      right: false,
      up: false,
      down: false
    };

    this.speed = 120;
    this.dx = 0;
    this.dy = 0;
    this.acc = 0.4;
    this.x = options.x || 200;
    this.y = options.y || 150;

    if (typeof module === "undefined") {
      this.clientInit();
    } else {
      this.serverInit();
    }
  }

  Player.prototype.clientInit = function() {
    this.texture = PIXI.Texture.fromImage("public/images/bunny.png");
    this.sprite = new PIXI.Sprite(this.texture);

    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;

    console.log(Pucko);
    this.sprite.position.x = this.x;
    this.sprite.position.y = this.y;

    Pucko.stage.addChild(this.sprite);

    console.log(Pucko.data.friction);

    var player = this;
    Pucko.$.on("beforeRender." + this.id, function(e, data) {
      player.move(data.delta);
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
    var player = this;
    this.serverEvents.on("playerMove", function(data) {
      if (data.id !== player.id) return;
      player.x = data.x;
      player.y = data.y;
    });
  }

  Player.prototype.serverRemove = function() {
    this.serverEvents.removeAllListeners();
  }

  Player.prototype.localInit = function() {
    var player = this;
    $(document).on({
      "keydown": function(e) {
        handler = keyDownEvents[e.keyCode]
        if (handler) {
          handler();
        }
      },
      "keyup": function(e) {
        handler = keyUpEvents[e.keyCode]
        if (handler) {
          handler();
        }
      }
    });

    Pucko.sync.trigger("playerConnected", player.id);
  }

  Player.prototype.remoteInit = function() {
    Pucko.sync.on("playerMove", function(e, data) {
      var player = Pucko.players[data.id];
      player.x = data.x;
      player.y = data.y;
    });
  }

  Player.prototype.move = function(delta) {
    var secondsDelta = delta / 1000,
        prevX = this.x,
        prevY = this.y;

    if (this.moving.left) {
      if(this.dx > -this.speed){
        this.dx -= this.acc;
      } else {
        this.dx = -this.speed;
      }
      // this.x -= this.speed * secondsDelta;
    }

    if (this.moving.right) {
      if(this.dx < this.speed){
        this.dx += this.acc;
      } else {
        this.dx = this.speed;
      }
      // this.x += this.speed * secondsDelta;
    }

    if (this.moving.up) {
      // this.y -= this.speed * secondsDelta;
      if(this.dy > -this.speed){
        this.dy -= this.acc;
      } else {
        this.dy = -this.speed;
      }
      
    }

    if (this.moving.down) {
      // this.y += this.speed * secondsDelta;
      if(this.dy < this.speed){
        this.dy += this.acc;
      } else {
        this.dy = this.speed;
      }

    }



    this.x += this.dx;
    this.y += this.dy;
    if(this.x + this.texture.width/2 >= Pucko.data.width) { 
      this.x = Pucko.data.width - this.texture.width;
      this.dx *= -1;
    }
    if(this.x <= 0 + this.texture.width/2){
      this.x = 0 + this.texture.width/2;
      this.dx *= -1; 
    }
    if(this.y + this.texture.height/2 >= Pucko.data.height){
      this.y = Pucko.data.height - this.texture.height/2;
      this.dy *= -1; 
    }
    if(this.y <= 0 + this.texture.height/2){
      this.y = 0 + this.texture.height/2;
      this.dy *= -1;  
    }
    // this.y += this.dy;
    if (prevX != this.x || prevY != this.y)
      Pucko.sync.trigger("playerMove", {id: this.id, x: this.x, y: this.y })
  }

  Player.prototype.render = function() {
    this.sprite.position.x = this.x;
    this.sprite.position.y = this.y;

    this.dx *= Pucko.data.friction;
    this.dy *= Pucko.data.friction;
    // console.log(Pucko.data);
  }

  Player.prototype.serialize = function() {
    return {id: this.id, x: this.x, y: this.y };
  }

  var keyDownEvents = {
    "37": function() {
      Pucko.localPlayer.moving.left = true;
    },
    "39": function() {
      Pucko.localPlayer.moving.right = true;
    },
    "40": function() {
      Pucko.localPlayer.moving.down = true;
    },
    "38": function() {
      Pucko.localPlayer.moving.up = true;
    }
  }

  var keyUpEvents = {
    "37": function() {
      Pucko.localPlayer.moving.left = false;
    },
    "39": function() {
      Pucko.localPlayer.moving.right = false;
    },
    "40": function() {
      Pucko.localPlayer.moving.down = false;
    },
    "38": function() {
      Pucko.localPlayer.moving.up = false;
    }
  }

  if (typeof module !== "undefined") {
    module.exports = Player;
  } else {
    Pucko.Player = Player;
  }
})();