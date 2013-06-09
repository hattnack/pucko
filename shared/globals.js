(function() {
  var globals = {
    width: 600,
    height: 300,
    goalWidth: 100,
    friction: 0.95,
    blockingFriction: 0.8,
    puckFriction: 0.98
  };

  if (typeof module !== "undefined") {
    module.exports = globals;
  } else {
    Pucko.globals = globals;
  }
})();