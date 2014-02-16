var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , _ = require('underscore')
  , path = require('path')

PORT = 80;

app.configure(function() {
    app.use(express.static(path.join(__dirname, 'public')));
});

server.listen(PORT);

globalCounter = 0;

io.sockets.on('connection', function (socket) {
    var myId = (globalCounter += 1);
    socket.emit("getId", myId);

    socket.on("setInfo", function (info) {
        io.sockets.emit("getInfo", info, myId);
    });

    socket.on("disconnect", function() {
        io.sockets.emit("disconnected", myId);
    });
});
