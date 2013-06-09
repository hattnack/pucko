(function() {
  var stage = null,
      renderer = null;
  Pucko.Stage = {
    width : 100,
    height: 400,
    init: function() {
      stage = new PIXI.Stage(0x66FF99);

      renderer = PIXI.autoDetectRenderer(this.width, this.height);

      document.body.appendChild(renderer.view);

      requestAnimFrame(Pucko.Stage.render);
    },
    render: function() {
      requestAnimFrame(Pucko.Stage.render);
      renderer.render(stage);
    }
  }
})();