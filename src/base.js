
/**********************************************************************

  provides core functionality of framework, such as module management,
  uniform type handling and code execution

**********************************************************************/

var Base = new function(instanceName) {

  // add String.trim which removes leading/trailing whitepsace from strings
  String.prototype.trim = function() {return this.replace(/^\s+/g, '').replace(/\s+$/g, '');}

  // fix Math.round to allow for scale
  Math.nativeRound = Math.round;
  Math.round = function(number, scale) {

    if (isNaN(scale) || scale < 0) {scale = 0;}

    number = this.nativeRound(number * this.pow(10, scale)) / this.pow(10, scale);

    if (scale > 0) {
      number = number.toString();
      if (number.indexOf('.') == -1) {number += '.0';}
      while (number.length - number.indexOf('.') - 1 < scale) {
        number += '0';
      }
    }

    return number.toString();

  }


  // add Number.format which applied comma formating per multiples of thousand
  Number.prototype.format = function() {

    var parts = this.toString().split('.');
    var formatted = [];

    for (var i = 1; i <= parts[0].length; i++) {
      formatted.unshift(parts[0].substr(parts[0].length - i, 1));
      if (i < parts[0].length && i % 3 == 0) {formatted.unshift(',');}
    }

    if (parts.length == 2) {formatted.push('.' + parts[1]);}

    return formatted.join('');

  }

  // add Array.shuffle which randomly sorts an array
  Array.prototype.shuffle = function() {
    return this.sort(function(a, b) {
      return Math.round(Math.random()) == 1 ? 1 : -1;
    });
  }

  var o = this;
  var scriptNames = {}; // list of require modules already imported

  o.onLoad = null;

  // includes a script
  o.include = function(scriptName) {

    var header = getHeader(); // the head tag's dom object
    var script = null;
    var success = false;

    // determine path to scripts
    scriptName = getPath(scriptName);

    // cross browser method for adding scripts to be run prior to document.onload
    try {
      if (typeof document.readyState != 'undefined' && document.readyState == 'loading') {
        document.write('<scr' + 'ipt type="text/javascr' + 'ipt" defer="true" src="' + scriptName + '"></scr' + 'ipt>');
        success = true;
      } else if (header) {
        script = document.createElement('scr' + 'ipt');
         script.defer = true;
         script.src = scriptName;
        header.appendChild(script);
        success = true;
      }
    } catch (err) {
      success = false;
    }

    return success;

  }

  // includes a script once only regardless of the number of require calls made to the same script
  o.require = function(scriptName) {

    if (!scriptNames[scriptName]) {
      scriptNames[scriptName] = o.include(scriptName);
    }

    return scriptNames[scriptName];

  }

  // uniform method accessing a variable's type
  o.getType = function(obj) {

    var type = '';

    // return specific type for arrays and non-js objects which are both considered
    // objects according to typeof
    if (typeof obj == 'object') {
      if (obj instanceof Array) {
        type = 'array'
      } else if (obj && (typeof obj.constructor != 'function' || (typeof obj.constructor.toString == 'function' && obj.constructor.toString().trim().indexOf('function') != 0))) {
        type = 'alien';
      }
    }

    // all other types via typeof
    if (type.length == 0) {
      if (obj == null) {
        type = 'null';
      } else {
        type = (typeof obj);
      }
    }

    return type;

  }

  // runs code, trapping errors, returning either code's return value if available, or a custom message
  o.run = function(script) {

    var rv = null;

    try {
      if (o.getType(script) == 'function') {
        // add brackets to call for functions passed in
        rv = eval(script());
      } else {
        rv = eval(script);
      }
    } catch (err) {
      // return error message
      rv = {'message' : instanceName + '.run() raised the following error: ' + err.message};
    }

    if (typeof rv == 'undefined') {
      // return success message if eval has no return value
      rv = {'message' : instanceName + '.run() completed successfully'};
    }

    return rv;

  }

  // adds scripts that have been added thru Base.require() as members of Base
  window.onload = function() {

    var bound = [];

    for (var k in scriptNames) {
      if (scriptNames) {
        bound[bound.length] = k;
        try {
          eval('o.' + k + ' = new ' + k + '(instanceName + \'.\' + k);');
        } catch (err) {bound.length--;}
      }
    }

    if (o.onLoad) {o.onLoad();}

    return bound;

  }

  // returns a dom object's id, adding a unique id if none exists
  o.getIdAttr = function(obj) {

    var hasId = false;
    var id = null;

    // check for existing id
    try {
      id = obj.getAttribute('id');
    } catch (err) {id = null;}

    // loop thru random ids until one is available
    if (!id && obj) {
      while (!hasId) {
        id = instanceName + '-' + Math.random().toString().replace('.', '');
        if (!document.getElementById(id)) {
          obj.setAttribute('id', id);
          hasId = true;
        }
      }
    }

    if (!id) {id = '';}

    return id;

  }


  // determines whether required dom members are available
  isCompatible = function() {

    var compatible = true;
    var docDependencies = [
      'createElement',
      'getElementsByTagName',
      'getElementById'
    ];

    for (var i = 0; i < docDependencies.length; i++) {
      compatible = compatible && eval('typeof document.' + docDependencies[i]) != 'undefined';
    }

    return compatible;

  }

  // returns the head tag's dom object
  getHeader = function() {

    var headers = [];
    var header = null;

    if (isCompatible()) {headers = document.getElementsByTagName('head');}
    if (headers.length > 0) {header = headers[0];}

    return header;

  }

  // determines the path of scripts based on the path of the Base script itself
  getPath = function(scriptName) {

    var path = '';
    var header = getHeader();
    var scripts = [];
    var rootScriptName = '/' + instanceName.toLowerCase() + '.js';

    // go thru the script tags inside the head tag, checking for the Base script, and determining its path when found
    if (header) {
      scripts = header.getElementsByTagName('scr' + 'ipt');
      for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src && scripts[i].src.toLowerCase().lastIndexOf(rootScriptName) > -1 && path.length == 0) {
          path = scripts[i].src.substr(0, scripts[i].src.toLowerCase().lastIndexOf(rootScriptName) + 1);
        }
      }
    }

    return path + scriptName.toLowerCase() + '.js';

  }

} ('Base');
