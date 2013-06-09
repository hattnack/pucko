(function() {
  var globals = {
    width: 600,
    height: 300,
    friction: 0.95
  };

  if (typeof module !== "undefined") {
    module.exports = globals;
  } else {
    Pucko.globals = globals;
  }
})();