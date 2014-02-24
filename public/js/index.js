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
      updateOscillator(info, id);
      updateOthersViews();
  });
  socket.on('disconnected', function(id) {
      getOscillator(id).stop();
      delete oscillators[id];
  });

  function updateOscillator(info, id) {
      var osc = getOscillator(id);
      var gainNode = osc.gainNode;
      gainNode.gain.value = info.volume;
      osc.frequency.value = info.freq;
      // osc.frequency.linearRampToValueAtTime(info.freq, 0);
  }

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

  window.ondevicemotion = function(evt) {
      window.evt = evt;
      var info = eventToInfo(evt);
      socket.emit("setInfo", info);
      updateYourView(evt);
  };

  function eventToInfo(evt) {
      return {
          freq : getFrequency(evt),
          volume : getVolume(evt),
      };
  }

  function getMidiNote(evt) {
      var diff;
      if(evt) {
          diff = evt.accelerationIncludingGravity.y * 2;
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

  function getFrequency(evt) {
      var midiNote = getMidiNote(evt);
      return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  function getVolume(evt) {
      if(evt) {
          return Math.sqrt(
                  evt.acceleration.x * evt.acceleration.x +
                  evt.acceleration.y * evt.acceleration.y +
                  evt.acceleration.z * evt.acceleration.z
                  ) / 10;
      } else {
          return 0.5;
      }
  }

  function updateOthersViews() {
      $("#freq").empty();
      _.each(oscillators, function(osc, id) {
          $("<p>" + id +":"+osc.frequency.value+" ("+osc.gainNode.gain.value+")</p>").appendTo("#freq");
      });
  }

  function updateYourView(evt) {
      var freq = getFrequency(evt);
      var volume = getVolume(evt);
      var midiNote = getMidiNote(evt);
      $("body").css("background-color", "hsl(" + (midiNote * 4) + ", 100%, " + (50 + volume * 50) + "%");
  }

});
