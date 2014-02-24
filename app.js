var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , _ = require('underscore')
  , path = require('path')
  , osc = require('node-osc')

PORT = 80;

app.configure(function() {
    app.use(express.static(path.join(__dirname, 'public')));
});


var client = new osc.Client('localhost', 3333)
client.send('/address', 100)

server.listen(PORT);

globalCounter = 0;

io.sockets.on('connection', function (socket) {
    var myId = (globalCounter += 1);
    socket.emit("getId", myId);

    //freq, volume
    socket.on("sendUpdate", function (evt) {
        io.sockets.emit("getUpdate", evt, myId);
    });

    socket.on("disconnect", function() {
        io.sockets.emit("disconnected", myId);
    });
});
