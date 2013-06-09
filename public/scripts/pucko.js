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

      this.teamScores = Pucko.sync.initData.teamScores || [0, 0];

      Pucko.stage.addChild(this.backgroundSprite);

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
        console.log(Pucko.teamScores);
      });

      Pucko.puck = new Pucko.Puck({});

      Pucko.localPlayer = new Pucko.Player({local: true, id: Pucko.sync.id, team: Pucko.sync.initData.team});
      Pucko.players[Pucko.sync.id] = Pucko.localPlayer;

      document.body.appendChild(this.renderer.view);
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
    }
  });

  if (Pucko.sync.ready) {
    Pucko.init();
  } else {
    Pucko.$.on("ready", Pucko.init);
  }
})();
