(function() {
  var websocket;

  window.Sync = {
    trigger: function(event, data) {
      websocket.send(JSON.stringify({event: event, data: data}));
    }
  };
  Sync.$ = $(Sync);

  websocket = new WebSocket("ws://" + window.location.hostname + ":3000");

  websocket.addEventListener("open", function() {
    Sync.$.trigger("ready");
  });

  websocket.addEventListener("message", function(e) {
    message = JSON.parse(e.data);
    Sync.$.trigger(message.event, message.data);
  });

  Sync.$.on("test", console.log.bind(console));

})();
