
function Panels(instanceName) {

  var o = this;
  var panels = {};
  var stepping = 0.17;

  o.panel = function(id) {

    if (!panels[id]) {
      panels[id] = new Panel(document.getElementById(id), o);
    }

    return panels[id];

  }

  Panel = function(obj, panels) {

    var o = this;
    var onFadeEnd = null;

    o.fade = function(setOpacity, endOpacity, onEnd, started) {

      if (!started) {
        o.log('fade start');
        setOpacity = setOpacity / 100;
        endOpacity = endOpacity / 100;
        if (onEnd) {onFadeEnd = onEnd;}
      }

      if (typeof obj.style != 'undefined') {
        if (typeof obj.style.opacity != 'undefined') {
          obj.style.opacity = Math.round(setOpacity, 2);
          started = true;
          o.log('moz opacity set to ' + Math.round(setOpacity, 2));
        } else if (typeof obj.style.filter != 'undefined') {
          obj.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + Math.round(setOpacity * 100) + ')';
          started = true;
          o.log('ie opacity set to ' + Math.round(setOpacity * 100));
        }
      }

      if (started) {
        obj.style.visibility = (setOpacity > 0 ? 'visible' : 'hidden');
      }

      if (!started || setOpacity == endOpacity) {
        o.log('fade end');
        if (onFadeEnd) {onFadeEnd();}
        onFadeEnd = null;
      } else {
        //setOpacity = Math.max(Math.max(0, endOpacity), Math.min(Math.min(1, endOpacity), setOpacity + (setOpacity < endOpacity ? stepping : stepping * -1)));
        setOpacity = Math.max(0, Math.min(1, setOpacity + (setOpacity < endOpacity ? stepping : stepping * -1)));
        window.setTimeout(instanceName + '.panel(\'' + obj.id + '\').fade(' + setOpacity + ', ' + endOpacity + ', false, true);', 50);
      }

    }

    o.log = function(msg) {
      panels.log(instanceName + '.panels(' + obj.id + ') ' + msg);
    }

    o.log('created');

  }

  o.log = function(msg) {return msg;}

}
