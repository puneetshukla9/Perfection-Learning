'use static';

export default function(hotkeys) {
  var hotkeyOptionStates = {};

  var config = {
    'showIDs': {
      keyStrokes: ['command+i', 'alt+i'],
      callback: toggle('showIDs')
    }
  };

  function toggle(id) {
    return function() {
      hotkeyOptionStates[id] = !hotkeyOptionStates[id];
    };
  }

  this.set = function(opt, scope) {
    var keyStrokes = config[opt].keyStrokes || [];
    var callback = config[opt].callback || null;
    hotkeys.bindTo(scope);
    keyStrokes.forEach(function(key) {
      hotkeys.add({ combo: key, callback: callback });
    });
  };

  this.get = function(opt) {
    return function() {
      return hotkeyOptionStates[opt];
    };

  };


};
