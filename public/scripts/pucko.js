(function() {
  var lastRenderTime = Date.now();

  $.extend(Pucko, {
    stage: null,
    renderer: null,
    players: {},

    init: function() {
      this.stage = new PIXI.Stage(0x66FF99);
      this.renderer = PIXI.autoDetectRenderer(Pucko.globals.width, Pucko.globals.height);
      this.background = PIXI.Texture.fromImage('public/images/background.png');
      this.backgroundSprite = new PIXI.Sprite(this.background);
      this.backgroundSprite.position.x = 0;
      this.backgroundSprite.position.y = 0;

      this.stage.position.x = 100;

      this.teamScores = Pucko.sync.initData.teamScores || [0, 0];

      Pucko.stage.addChild(this.backgroundSprite);

      var textStyle = {
        font: 'lighter 70px helvetica neue',
        fill: "rgba(189,71,71,0.2)"
      }

      this.leftPoints = new PIXI.Text("" + this.teamScores[0], textStyle);
      this.leftPoints.anchor.x = 0;
      this.leftPoints.anchor.y = 0.15;
      this.leftPoints.position.x = 30;
      this.leftPoints.position.y = Pucko.globals.height / 2 - 70/2;

      this.rightPoints = new PIXI.Text("" + this.teamScores[1], textStyle);
      this.rightPoints.anchor.x = 1;
      this.rightPoints.anchor.y = 0.15;

      this.rightPoints.position.x = Pucko.globals.width - 30;
      this.rightPoints.position.y = Pucko.globals.height / 2 - 70/2;
      // this.leftPoints.position.y = Pucko.stage
      this.stage.addChild(this.leftPoints);
      this.stage.addChild(this.rightPoints);

      this.initPlayers(Pucko.sync.initData.players);
      Pucko.sync.on("playerConnected", function(e, data) {
        var newPlayer = new Pucko.Player({id: data.id, team: data.team});
        newPlayer.deserialize(data);
        Pucko.players[data.id] = newPlayer;
      });
      Pucko.sync.on("playerDisconnected", function(e, id) {
        Pucko.players[id].clientRemove();
        delete Pucko.players[id];
      });

      Pucko.sync.on("score", function(event, data) {
        Pucko.teamScores[data.team] = data.score;
        Pucko.leftPoints.setText("" + Pucko.teamScores[0]);
        Pucko.rightPoints.setText("" + Pucko.teamScores[1]);
      });

      Pucko.sync.on("shake", function(event, data) {
        Pucko.shake(data.intensity);
      });

      Pucko.puck = new Pucko.Puck({});

      Pucko.localPlayer = new Pucko.Player({local: true, id: Pucko.sync.id, team: Pucko.sync.initData.team});
      Pucko.players[Pucko.sync.id] = Pucko.localPlayer;

      document.getElementById("game").appendChild(this.renderer.view);
      requestAnimFrame(this.render.bind(this));
    },

    render: function() {
      requestAnimFrame(this.render.bind(this));

      Pucko.$.trigger("beforeRender", {delta: Date.now() - lastRenderTime});
      this.renderer.render(this.stage);
      lastRenderTime = Date.now();
    },

    initPlayers: function(players) {
      for (var i = players.length - 1; i >= 0; i--) {
        console.log(players[i]);
        Pucko.players[players[i].id] = new Pucko.Player(players[i]);
      }
    },

    shake: function(intensity) {
      var $canvas = $("canvas");
      intensity -= 1;
      var x = intensity * (Math.random() > 0.5 ? -1 : 1);
      var y = intensity * (Math.random() > 0.5 ? -1 : 1);
      $canvas.css("-webkit-transform", "translate3D(" + x + "px," + y + "px, 0)");
      setTimeout(function() {
        $canvas.css("-webkit-transform", "none");
      }, 50);
    }
  });

  if (Pucko.sync.ready) {
    Pucko.init();
  } else {
    Pucko.$.on("ready", Pucko.init);
  }
})();
