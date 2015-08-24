
var DesktopSingleton = new Desktop();
function Desktop() {

  if (DesktopSingleton) return DesktopSingleton;

  var o = this;

  o.posX = 0, o.posY = 0, o.posZ = 0;
  o.minW = 100, o.minH = 100;
  o.loaded = false, o.resizing = false, o.dragging = false;
  o.desk = null, o.active = null;

  o.load = function() {
    o.desk = document.getElementsByTagName('body')[0];
    o.desk.innerHTML += '<div id="outline" style="position:relative; display:none;">&nbsp;</div>';
    o.outline = document.getElementById('outline');
    o.loaded = true;
  }

  o.add = function(html) {

    var id = '', s = '';

    do {
      id = 'w' + Math.random().toString().replace('.', '');
    } while (document.getElementById(id));

    s += '<table unselectable="on" cellpadding="0" cellspacing="0" border="0" class="window" id="' + id + '" onclick="return DesktopSingleton.focus(\'' + id + '\');">';
    s += '  <tr><td unselectable="on" colspan="5" height="5" class="edge height window">&nbsp;</td></tr>';
    s += '  <tr>';
    s += '    <td unselectable="on" rowspan="3" class="edge width window">&nbsp;</td>';
    s += '    <td unselectable="on" rowspan="3" class="edge width title" onmousedown="return DesktopSingleton.drag(\'' + id + '\');">&nbsp;</td>';
    s += '    <td unselectable="on" class="edge height title" onmousedown="return DesktopSingleton.drag(\'' + id + '\');">&nbsp;</td>';
    s += '    <td unselectable="on" rowspan="3" class="edge width title" onmousedown="return DesktopSingleton.drag(\'' + id + '\');">&nbsp;</td>';
    s += '    <td unselectable="on" rowspan="3" class="edge width window">&nbsp;</td></tr>';
    s += '    <tr>';
    s += '      <td unselectable="on" class="title" onmousedown="return DesktopSingleton.drag(\'' + id + '\');">';
    s += '        <a unselectable="on" class="button font" href="#" onclick="return DesktopSingleton.close(\'' + id + '\');">x</a>';
    s += '        <a unselectable="on" class="button font" href="#" onclick="return DesktopSingleton.toggle(\'' + id + '\');">/</a>';
    s += '        <h2 unselectable="on" class="title font">title</h2>';
    s += '      </td>';
    s += '    </tr>';
    s += '    <tr><td unselectable="on" class="edge height title" onmousedown="return DesktopSingleton.drag(\'' + id + '\');">&nbsp;</td></tr>';
    s += '    <tr><td unselectable="on" colspan="5" class="edge height window">&nbsp;</td></tr>';
    s += '    <tr>';
    s += '      <td unselectable="on" rowspan="3" class="edge width window">&nbsp;</td>';
    s += '      <td unselectable="on" rowspan="3" class="edge width main">&nbsp;</td>';
    s += '      <td unselectable="on" height="5" class="edge height main">&nbsp;</td>';
    s += '      <td unselectable="on" rowspan="3" class="edge width main">&nbsp;</td>';
    s += '      <td unselectable="on" rowspan="3" class="edge width window">&nbsp;</td>';
    s += '    </tr>';
    s += '    <tr><td unselectable="on" class="font"><div class="window"><script type="text/javascript">' + html + '</script></div></td></tr>';
    s += '    <tr><td unselectable="on" class="edge height main">&nbsp;</td></tr>';
    s += '    <tr>';
    s += '      <td unselectable="on" colspan="4" class="edge height window">&nbsp;</td>';
    s += '      <td unselectable="on" class="window"><a unselectable="on" class="button font resize" href="#" onclick="return false;" onmousedown="return DesktopSingleton.resize(\'' + id + '\');">/</a></td>';
    s += '    </tr>';
    s += '  </table>';
    o.desk.innerHTML += s;

    o.show(id);

  }

  o.setActive = function(id) {

    if (o.loaded) {
      if (!o.active || o.active.getAttribute('id') != id) {
        o.active = document.getElementById(id);
      }
      return true;
    } else {
      return false;
    }

  }

  o.focus = function(id) {

    if (o.setActive(id)) {
      o.active.style.zIndex = ++o.posZ;
      return true;
    } else {
      return false;
    }

  }

  o.show = function(id) {
    if (o.focus(id)) o.active.style.display = 'block';
    return false;
  }

  o.drag = function(id) {

    if (o.loaded && !o.resizing && !o.dragging && o.active) {
      o.dragging = true;
      o.toggleOutline();
    }

    return false;

  }

  o.resize = function(id) {

    if (o.loaded && !o.resizing && o.active) {
      o.resizing = true;
      o.toggleOutline();
    }

    return false;

  }

  o.close = function(id) {

    var tempActive = o.active;

    if (o.loaded && o.active) {
      o.active.style.display = 'none';
      if (tempActive) o.setActive(tempActive.getAttribute('id'));
    }

    return false;

  }

  o.toggle = function(id) {
    return false;
  }

  o.toggleOutline = function() {

    if (o.loaded && o.active) {
      //with (o.outline.style) {
        if (o.outline.style.display != 'block') {

          o.outline.style.display = 'block';
          o.outline.style.width = 300;//o.active.offsetWidth;
          //alert(o.outline.style.width);
          //alert(o.outline.offsetWidth);
          o.outline.style.height = 300;//o.active.offsetHeight;
          o.outline.style.left = 300;//o.active.offsetLeft;
          o.outline.style.top = 300;//o.active.offsetTop;
          o.outline.style.zIndex = 10;//++o.posZ;
          o.outline.innerHTML += 'FUCK';

        } else {

          o.outline.style.display = 'none';

        }
      //}
      o.desk.style.cursor = o.resizing ? 'se-resize' : o.dragging ? 'move' : 'default';
    }

  }

  o.dragOutline = function(x, y) {

    if (o.loaded && o.active) {
      //with (o.outline) {

        /*if (o.outline.offsetLeft <= 0 && x < 0) x = 0;
        if (o.outline.offsetLeft + o.outline.offsetWidth >= o.active.parentNode.offsetWidth && x > 0) x = 0;
        if (o.outline.offsetTop <= 0 && y < 0) y = 0;
        if (o.outline.offsetTop + o.outline.offsetHeight >= o.active.parentNode.offsetHeight && y > 0) y = 0;*/

        o.outline.style.left = o.outline.offsetLeft + x;
        o.outline.style.top = o.outline.offsetTop + y;

      //}
    }

  }

  o.resizeOutline = function(x, y) {

    if (o.loaded && o.active) {
      //with (o.outline) {

        /*if (o.outline.offsetLeft + o.outline.offsetWidth >= o.active.parentNode.offsetWidth && x > 0) x = 0;
        if (o.outline.offsetWidth <= o.minW && x < 0) x = 0;
        if (o.outline.offsetTop + o.outline.offsetHeight >= o.active.parentNode.offsetHeight && y > 0) y = 0;
        if (o.outline.offsetHeight <= o.minH && y < 0) y = 0;*/

        o.outline.style.width = o.outline.offsetWidth + x;
        o.outline.style.height = o.outline.offsetHeight + y;

      //}
    }

  }

  document.onmousemove = function(e) {

    var moveX = 0, moveY = 0;
    e = (e ? e : (window.event ? window.event : null));

    if (e && o.loaded) {

      moveX = e.clientX - o.posX; moveY = e.clientY - o.posY;
      if (o.loaded) {
        if (o.resizing) {
          o.resizeOutline(moveX, moveY);
        } else if (o.dragging) {
          o.dragOutline(moveX, moveY);
        }
      }
      o.posX = e.clientX; o.posY = e.clientY;

    }

    setStatus(

      'DesktopSingleton.outline.style.top',
      'DesktopSingleton.outline.style.left',
      'DesktopSingleton.outline.style.width',
      'DesktopSingleton.outline.style.height',
      'DesktopSingleton.outline.style.position',
      'DesktopSingleton.outline.offsetTop',
      'DesktopSingleton.outline.offsetLeft',
      'DesktopSingleton.outline.offsetWidth',
      'DesktopSingleton.outline.offsetHeight',
      'DesktopSingleton.outline.style.display',
      'DesktopSingleton.outline.style.zIndex',

      'DesktopSingleton.resizing',
      'DesktopSingleton.dragging',
      'DesktopSingleton.posX',
      'DesktopSingleton.posY',
      'DesktopSingleton.posZ',
      '!!DesktopSingleton.active',

      'DesktopSingleton.active.style.top',
      'DesktopSingleton.active.style.left',
      'DesktopSingleton.active.style.width',
      'DesktopSingleton.active.style.height',
      'DesktopSingleton.active.style.position',
      'DesktopSingleton.active.offsetTop',
      'DesktopSingleton.active.offsetLeft',
      'DesktopSingleton.active.offsetWidth',
      'DesktopSingleton.active.offsetHeight',
      'DesktopSingleton.active.style.display',
      'DesktopSingleton.active.style.zIndex'

    );

  }

  document.onmouseup = function() {

    var win2, win1;

//    if (o.resizing) {
//      win1 = o.active.style;
//      win2 = win1.getElementsByTagName('div')[0];
//      win2.style.width = outline.offsetWidth - (win1.offsetWidth - win2.offsetWidth);
//      win2.style.height = outline.offsetHeight - (win1.offsetHeight - win2.offsetHeight);
//    } else if (o.dragging) {
//      win1 = o.active.style;
//      win1.style.left = outline.offsetLeft;
//      win1.style.top = outline.offsetTop;
//    }

    o.resizing = false;
    o.dragging = false;
    o.toggleOutline();

  }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function setStatus() {
  var s = '';
  for (var i = 0; i < arguments.length; i++) {
    try {
      s += (arguments[i] + ': ' + (eval(arguments[i]) ? eval(arguments[i]) : 'false') + '<br />');
    } catch (e) {}
  }
  document.getElementById('status').innerHTML = s;
}

