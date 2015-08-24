
/**********************************************************************

  provides object-to-string serialization and string-to-object parsing

**********************************************************************/

function Json() {

  var o = this;

  // evals json string into object
  o.parse = function(json) {
    return Base.run('(' + json + ')');
  }

  // returns json string representation of object
  o.serialize = function(obj) {

    var json = '';
    var items = [];

    switch (Base.getType(obj)) {

      case 'alien' : // reflecting on non-js objects causes errors
        break;

      case 'object' : // recurse items
        for (var k in obj) {
          try {
            items[items.length] = o.serialize(k) + ':' + o.serialize(obj[k]);
          } catch (err) {alert(err.message);}
        }
        json = '{' + items.join(',') + '}';
        //} catch (err) {json = '';}
        break;

      case 'array' : // recurse items
        for (var i = 0; i < obj.length; i++) {
          items[items.length] = o.serialize(obj[i]);
        }
        json = '[' + items.join(',') + ']';
        break;

      case 'string' : // format strings
        json = ('"' + obj.replace(/(["\\])/g, '\\$1') + '"'
          ).replace(/[\f]/g, '\\f'
          ).replace(/[\b]/g, '\\b'
          ).replace(/[\n]/g, '\\n'
          ).replace(/[\t]/g, '\\t'
          ).replace(/[\r]/g, '\\r');
        break;

      default : // cast func, bool, num, undef, null to string
        json = String(obj);
        break;

    }

    if (json.length == 0) {json = 'null';}

    return json;

  }

}
