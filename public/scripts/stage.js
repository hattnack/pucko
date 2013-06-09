(function() {
  var stage = null,
      renderer = null;
  Pucko.Stage = {
    init: function() {
      stage = new PIXI.Stage(0x66FF99);
      renderer = PIXI.autoDetectRenderer(800, 400);

      document.body.appendChild(renderer.view);

      requestAnimFrame(Pucko.Stage.render);
    },
    render: function() {
      requestAnimFrame(Pucko.Stage.render);
      renderer.render(stage);
    }
  }
})();