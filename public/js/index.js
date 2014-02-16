require([
        'jquery',
        'underscore',
        'socket.io',
        ], function(
            $, _, io
            ) {
  $("<script src='http://"+window.location.hostname+":35729/livereload.js'></scr" + "ipt>").appendTo("head");

  var context;
  if (typeof AudioContext !== "undefined") {
    context = new AudioContext();
  } else if (typeof webkitAudioContext !== "undefined") {
    context = new webkitAudioContext();
  } else {
    alert('AudioContext not supported. :(');
  }

  // a map from id's to oscillators
  var oscillators = {};

  window.oscillators = oscillators;

  // integer id
  var myId = undefined;

  socket = io.connect();
  socket.on('getId', function(id) {
      myId = id;
  });
  socket.on('getInfo', function(info, id) {
      var osc = getOscillator(id);
      var gainNode = osc.gainNode;
      gainNode.gain.value = info.volume;
      osc.frequency.value = info.freq;
      // osc.frequency.linearRampToValueAtTime(info.freq, 0);
  });
  socket.on('disconnected', function(id) {
      getOscillator(id).stop();
      delete oscillators[id];
  });

  function getOscillator(id) {
    var osc = oscillators[id];
    if(!osc) {
        osc = context.createOscillator();

        var gainNode = context.createGainNode();
        osc.gainNode = gainNode;
        osc.connect(gainNode);
        gainNode.connect(context.destination);

        osc.start(0);
        oscillators[id] = osc;
    }
    return osc;
  }

  window.lastEvent = undefined;
  window.ondevicemotion = function(e) {
      lastEvent = e;
  };

  function getMidiNote() {
      var diff;
      if(lastEvent) {
          diff = lastEvent.accelerationIncludingGravity.y * 2;
      } else {
          diff = 0;
      }
      var notes = [0,  2,  4,  5,  7,  9,  11,
                   12, 14, 16, 17, 19, 21, 23,
                   24, 26, 28, 29, 31, 33, 35,
                   36];
      var signum = diff < 0 ? -1 : 1;
      var diff = notes[Math.floor(Math.abs(diff)) % notes.length];
      var midiNote = 65 + diff * signum;
      return midiNote;
  }

  function getFrequency() {
      var midiNote = getMidiNote();
      return 440 * Math.pow(2, (midiNote - 69) / 12);
      // return 440 * Math.pow(2, Math.floor(diff) / 12);
      // return parseInt($("#freqInput").val()) + diff;
  }

  function getVolume() {
      if(lastEvent) {
          return Math.sqrt(
                  lastEvent.acceleration.x * lastEvent.acceleration.x +
                  lastEvent.acceleration.y * lastEvent.acceleration.y +
                  lastEvent.acceleration.z * lastEvent.acceleration.z
                  ) / 10;
      } else {
          return 0.5;
      }
  }

  window.oldInfo = undefined;
  // update views, send info again
  function update() {
      var freq = getFrequency();
      var midiNote = getMidiNote();
      var volume = getVolume();
      $("body").css("background-color", "hsl(" + (midiNote * 4) + ", 100%, " + (50 + volume * 50) + "%");

      $("#freq").empty();
      _.each(oscillators, function(osc, id) {
          $("<p>" + id +":"+osc.frequency.value+" ("+osc.gainNode.gain.value+")</p>").appendTo("#freq");
      });
      var volume = getVolume();
      var info = {
          freq : freq,
          volume : volume,
      };
      if(!_.isEqual(window.oldInfo, info)) {
          socket.emit("setInfo", info);
          oldInfo = info;
      }
      requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
});
