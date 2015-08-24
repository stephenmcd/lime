
// Base.require needs to parse js source to determine inner requirements
// so ths IFrame module was going to be hard wired into base and used for
// this purpose only, so that Http would not be reqd and therefore could
// be a separate module, but IE won't load js files into the iframe as
// text and forces the open/save dialog.

// i toyed around in my head with the idea of simply requiring that modules
// use a file extention that will be recognised as text, like txt or htm,
// however the ugliess of that coupled with the notion that Http will be
// slighlty faster than IFrame, led me to just make base dependant on Http.

// so, this doesn't actually get used. if it was to be used it'd need a
// simple queue as well, as load will cancel out any frame currently
// loading, prob only a few more lines of code.

// alternatively this could form the basis for a fallback for Http when no
// xhr is available, as Http already has a queue and lots of events for
// callbacks built into it.

function IFrame(instanceName) {

  var o = this;
  var frame;

  o.load = function(url) {

    o.log(instanceName + '.load', url);
    if (!frame) {frame = getFrame();}
    frame.src = url;
    o.poll();

  }

  o.poll = function() {

    var data = null;

    if (typeof this.contentDocument != 'undefined') {
      data = String(this.contentDocument.body.innerHTML);
    } else if (frame && typeof frame.readyState != 'undefined') {
      if (frame.readyState == 'complete') {
        data = String(window.frames[frame.id].document.documentElement.innerText);
      } else {
        window.setTimeout(instanceName + '.poll();', 100);
      }
    }

    if (Base.getType(data) == 'string') {
      data = data.trim();
      onLoad(data);
    }

  }

  o.log = function(member, msg) {
    return member + ' :\n' + msg;
  }

  getFrame = function() {

    var frame = document.createElement('iframe');
    frame.src = '';
    frame.style.display = 'none';
    frame.onload = o.poll;

    document.getElementsByTagName('body')[0].appendChild(frame);
    Base.getIdAttr(frame);
    return frame;

  }

  onLoad = function(msg) {
    o.log(instanceName + '.onload', msg);
  }

}
