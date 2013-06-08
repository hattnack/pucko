
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , WebSocketServer = require('websocket').server
  , currentID = 0
  , clients = {};

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
app.use(express.static(path.join(__dirname, 'public')));

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

function setupConnection(connection) {
  var ID = currentID++;
  clients[ID] = {
    connection: connection
  };

  connection.on("message", function(message) {
    var client, clientID;

    for (clientID in clients) {
      if (+clientID !== ID) {
        client = clients[clientID].connection.sendUTF(message.utf8Data);
      }
    }
  });

  connection.on("close", function(reasonCode, description) {
    delete clients[ID];
  });
}
