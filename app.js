var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , _ = require('underscore')
  , path = require('path')
  , osc = require('osc-min')
  , udp = require('dgram')

PORT = 80;

app.configure(function() {
    app.use(express.static(path.join(__dirname, 'public')));
});


var client = udp.createSocket("udp4");
// var buf = osc.toBuffer({
//     address: "/address",
//     args: 200
// });
// client.send(buf, 0, buf.length, 3333, "localhost");

server.listen(PORT);

globalCounter = 0;

io.sockets.on('connection', function (socket) {
    var myId = (globalCounter += 1);
    socket.emit("getId", myId);

    //freq, volume
    socket.on("sendMotion", function (evt) {
        io.sockets.emit("getMotion", evt, myId);
        var buf = osc.toBuffer({
            oscType: "bundle",
            timetag: evt.timeStamp,
            elements: [
            {
                address: "/acceleration",
                args: [evt.acceleration.x, evt.acceleration.y, evt.acceleration.z],
            },
            {
                address: "/accelerationIncludingGravity",
                args: [evt.accelerationIncludingGravity.x, evt.accelerationIncludingGravity.y, evt.accelerationIncludingGravity.z],
            },
            ],
        });
        client.send(buf, 0, buf.length, 3333, "localhost");
    });
    socket.on("sendOrientation", function (evt) {
        var buf = osc.toBuffer({
            address: "/orientation",
            args: [evt.alpha, evt.beta, evt.gamma],
        });
        client.send(buf, 0, buf.length, 3333, "localhost");
    });

    socket.on("disconnect", function() {
        io.sockets.emit("disconnected", myId);
    });
});
