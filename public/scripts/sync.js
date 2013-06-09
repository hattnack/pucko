(function() {
  var websocket;

  Pucko.sync = {
    id: null,
    ready: false,
    trigger: function(event, data) {
      websocket.send(JSON.stringify({event: event, data: data}));
    },
    on: function() {
      Pucko.sync.$.on.apply(Pucko.sync.$, arguments);
    },
    one: function() {
      Pucko.sync.$.one.apply(Pucko.sync.$, arguments);
    },
    off: function() {
      Pucko.sync.$.off.apply(Pucko.sync.$, arguments);
    }
  };
  Pucko.sync.$ = $(Pucko.sync);

  websocket = new WebSocket("ws://" + window.location.hostname + ":3000");

  websocket.addEventListener("open", function() {
    Pucko.sync.one("receiveInitData", function(e, data) {
      Pucko.sync.id = data.id;
      Pucko.sync.initData = data;
      Pucko.sync.ready = true;
      Pucko.$.trigger("ready");
    });
  });

  websocket.addEventListener("message", function(e) {
    message = JSON.parse(e.data);
    Pucko.sync.$.trigger(message.event, message.data);
  });
})();
