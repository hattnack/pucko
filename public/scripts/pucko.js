(function() {
  var lastRenderTime = Date.now();

  $.extend(Pucko, {
    stage: null,
    renderer: null,
    players: {},

    init: function() {
      this.stage = new PIXI.Stage(0x66FF99);
      this.renderer = PIXI.autoDetectRenderer(Pucko.globals.width, Pucko.globals.height);

      this.initPlayers(Pucko.sync.initData.players);
      Pucko.sync.on("playerConnected", function(e, id) {
        Pucko.players[id] = new Pucko.Player({id: id});
      });
      Pucko.sync.on("playerDisconnected", function(e, id) {
        Pucko.players[id].clientRemove();
        delete Pucko.players[id];
      });

      Pucko.puck = new Pucko.Puck({});

      if (_.keys(Pucko.players).length < 2) {
        Pucko.localPlayer = new Pucko.Player({local: true, id: Pucko.sync.id});
        Pucko.players[Pucko.sync.id] = Pucko.localPlayer;
      }

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
