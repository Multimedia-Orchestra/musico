require([
        'jquery',
        'underscore',
        'socket.io',
        ], function(
            $, _, io
            ) {
  $("<script src='http://"+window.location.hostname+":35729/livereload.js'></scr" + "ipt>").appendTo("head");

  var context = new window.webkitAudioContext();

  // a map from id's to oscillators
  var oscillators = {};

  window.oscillators = oscillators;

  // integer id
  var myId = undefined;

  socket = io.connect();
  socket.on('getId', function(id) {
      myId = id;
  });
  socket.on('getFreq', function(freq, id) {
      getOscillator(id).frequency.value = freq;
  });
  socket.on('disconnected', function(id) {
      getOscillator(id).stop();
      delete oscillators[id];
  });

  function getOscillator(id) {
    var osc = oscillators[id];
    if(!osc) {
        osc = context.createOscillator();
        osc.connect(context.destination);
        osc.start(0);
        oscillators[id] = osc;
    }
    return osc;
  }

  var lastEvent;
  window.ondevicemotion = function(e) {
      lastEvent = e;
  };

  function getFrequency() {
      var diff;
      if(lastEvent) {
          diff = lastEvent.accelerationIncludingGravity.y * 10;
      } else {
          diff = 0;
      }
      return parseInt($("#freqInput").val()) + diff;
  }

  function updateFrequency() {
      var freq = getFrequency();
      $("#freq").empty();
      _.each(oscillators, function(osc, id) {
          $("<p>" + id +":"+osc.frequency.value+"</p>").appendTo("#freq");
      });
      socket.emit("freq", freq);
      requestAnimationFrame(updateFrequency);
  }

  requestAnimationFrame(updateFrequency);
});
