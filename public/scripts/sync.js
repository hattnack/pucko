(function() {
  window.Sync = {}

  new WebSocket("ws://" + window.location.hostname + ":3000");
})();