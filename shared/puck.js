var globals;
if (typeof require !== "undefined") {
  globals = require("./globals");
} else {
  globals = Pucko.globals;
}
(function() {
  function Puck(options) {
    this.width = 20;
    this.height = 10;
    this.serverEvents = options.serverEvents || null;
    this.reset();
    if (typeof module === "undefined") {
      this.clientInit();
    } else {
      this.serverInit();
    }
  }

  Puck.prototype.reset = function() {
    this.inPlay = true;
    this.x = globals.width / 2;
    this.y = globals.height / 2;
    this.dx = 0;
    this.dy = 0;
  }

  Puck.prototype.clientInit = function() {
    this.texture = PIXI.Texture.fromImage("public/images/puck.png");
    this.sprite = new PIXI.Sprite(this.texture);

    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;

    this.sprite.position.x = this.x;
    this.sprite.position.y = this.y;

    Pucko.stage.addChild(this.sprite);

    var puck = this;
    Pucko.sync.on("puckUpdate", function(e, data) {
      puck.x = data.x;
      puck.y = data.y;
      puck.dx = data.dx;
      puck.dy = data.dy;
    });

    Pucko.$.on("beforeRender", function(e, data) {
      puck.render();
    });
  };

  Puck.prototype.serverInit = function() {
    var puck = this;
    this.serverEvents.on("frame", this.update.bind(this));
    this.serverEvents.on("playerShoot", this.shoot.bind(this));
    this.serverEvents.on("playerUpdate", this.dribble.bind(this));
  };

  Puck.prototype.update = function(delta) {
    if (!this.inPlay) return;
    var secondsDelta = delta / 1000;

    this.dx = Math.min(30, this.dx);
    this.dx = Math.max(-30, this.dx);

    this.dy = Math.min(30, this.dy);
    this.dy = Math.max(-30, this.dy);

    this.x += this.dx;
    this.y += this.dy;

    if ((this.x + this.width / 2) > globals.width) {
      if (this.y < (globals.height / 2 + globals.goalWidth / 2) &&
          this.y > (globals.height / 2 - globals.goalWidth / 2)) {
        this.score(0);
      } else {
        this.dx *= -1;
        this.x = globals.width - this.width / 2;
      }
    } else if ((this.x - this.width / 2) < 0) {
      if (this.y < (globals.height / 2 + globals.goalWidth / 2) &&
          this.y > (globals.height / 2 - globals.goalWidth / 2)) {
        this.score(1);
      } else {
        this.dx *= -1;
        this.x = 0 + this.width / 2;
      }
    }

    if ((this.y + this.height / 2) > globals.height) {
      this.dy *= -1;
      this.y = globals.height - this.height / 2;
    } else if ((this.y - this.height / 2) < 0) {
      this.dy *= -1;
      this.y = 0 + this.height / 2;
    }

    this.dx *= globals.puckFriction;
    this.dy *= globals.puckFriction;
  };

  Puck.prototype.score = function(team) {
    this.serverEvents.emit("score", team);
    this.inPlay = false;
    this.x = -100;
    setTimeout(this.reset.bind(this), 2000);
  };

  Puck.prototype.dribble = function(player) {
    var x = player.x,
        y = player.y,
        xDistance = this.x - x,
        yDistance = this.y - y;

    if (Math.abs(xDistance) <= 50 && Math.abs(yDistance) <= 50) {
      var angle = Math.atan2(xDistance, yDistance),
          force;

      if (Math.abs(xDistance) < 10 && Math.abs(yDistance) < 10 && player.blocking) {
        this.dx = 0;
        this.dy = 0;
      }

      force =  1 / Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
      if (force > 25) {
        force = 25;
      }
      this.dy += Math.sin(angle + Math.PI / 2) * force * 2 + player.dy * 0.01;
      this.dx -= Math.cos(angle + Math.PI / 2) * force * 2 - player.dx * 0.01;
    }
  }

  Puck.prototype.shoot = function(player) {
    var x = player.x,
        y = player.y,
        xDistance = this.x - x,
        yDistance = this.y - y;

    if (Math.abs(xDistance) <= 50 && Math.abs(yDistance) <= 50) {
      var angle = Math.atan2(xDistance, yDistance),
          force;

      if (xDistance === 0 && yDistance === 0) {
        force = 25;
      } else {
        force = 1 / Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
        if (force > 25) {
          force = 25;
        }
      }
      this.dy += Math.sin(angle + Math.PI / 2) * force * 200 + player.dy * 2;
      this.dx -= Math.cos(angle + Math.PI / 2) * force * 200 - player.dx * 2;
      this.serverEvents.emit("shoot", force);
    }
  }

  Puck.prototype.sync = function(clients) {
    for (var clientID in clients) {
      clients[clientID].connection.sendUTF(JSON.stringify({
        event: "puckUpdate",
        data: {
          x: this.x,
          y: this.y,
          dx: this.dx,
          dy: this.dy
        }
      }));
    }
  };

  Puck.prototype.render = function() {
    this.sprite.position.x = this.x;
    this.sprite.position.y = this.y;
  };

  if (typeof module !== "undefined") {
    module.exports = Puck;
  } else {
    Pucko.Puck = Puck;
  }
})();