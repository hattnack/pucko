
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , WebSocketServer = require('websocket').server
  , currentID = 0
  , clients = {}
  , serverEvents = new (require('events').EventEmitter)()
  , lastFrameTime = Date.now()
  , Player = require('./shared/player');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use("/public", express.static(path.join(__dirname, 'public')));
app.use("/shared", express.static(path.join(__dirname, 'shared')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var webServer = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

app.get("/", function(req, res) {
  res.render("index");
});

var webSocketServer = new WebSocketServer({
  httpServer: webServer
});

webSocketServer.on("request", function(req) {
  setupConnection(req.accept(null, req.origin));
});

setInterval(nextFrame, 1000 / 60);

function setupConnection(connection) {
  console.log("new");
  var ID = currentID++;
  var players = (function() {
    var players = [];
    for (var clientID in clients) {
      players.push(clients[clientID].player.serialize());
    }
    return players;
  })();

  clients[ID] = {
    connection: connection
  };

  connection.sendUTF(JSON.stringify({event: "receiveInitData", data: {
    id: ID,
    players: players
  }}));

  if (players.length < 2) {
    clients[ID].player = new Player({id: ID, serverEvents: serverEvents});
  }

  connection.on("message", function(message) {
    var client, clientID, json;

    for (clientID in clients) {
      if (+clientID !== ID) {
        client = clients[clientID].connection.sendUTF(message.utf8Data);
      }
    }

    json = JSON.parse(message.utf8Data);
    serverEvents.emit(json.event, json.data);
  });

  connection.on("close", function(reasonCode, description) {
    if(clients[ID].player) {
      clients[ID].player.serverRemove();
      for (var clientID in clients) {
        if (+clientID !== ID) {
          client = clients[clientID].connection.sendUTF(JSON.stringify({
            event: "playerDisconnected",
            data: ID
          }));
        }
      }
    }
    delete clients[ID];
  });
}

function nextFrame() {
  serverEvents.emit("frame", Date.now() - lastFrameTime);
  lastFrameTime = Date.now();
}
