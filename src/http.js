
/**********************************************************************

  provides access to http requests, thru either an asynchronous queue
  direct synchrounous requests

**********************************************************************/

function Http(instanceName) {

  var o = this
  var currentRequestId = 0; // id increment for request objects in queue
  var userAgent = 'Lime Http';

  o.onQueueStart = null; // event handler for queue start
  o.onQueueEnd = null; // event handler for queue end

  o.onRequestAdd = null; // event handler for request add
  o.onRequestRemove = null; // event handler for request remove
  o.onRequestLoad = null; // event handler for request load
  o.onRequestError = null; // event handler for request error

  o.queue = [];
  o.error = '';
  o.xhr = getXhr();

  // cross-browser handler for returning xhr object
  function getXhr() {

    var xhr = null;
    var msHttpProgIds = [
      'Msxml2.XMLHTTP',
      'Microsoft.XMLHTTP',
      'Msxml2.XMLHTTP.4.0'
    ];

    // use standard xhr object
    if (typeof XMLHttpRequest != 'undefined') {xhr = new XMLHttpRequest();}

    // use ms xhr object
    if (!xhr && typeof ActiveXObject != 'undefined') {
      for (var i = 0; i < msHttpProgIds.length; i++) {
        if (!xhr) {
          try {
            xhr = new ActiveXObject(msHttpProgIds[i]);
          } catch (err) {xhr = null;}
        }
      }
    }

    if (!xhr) {o.error = 'Could not create XmlHttpRequest';}

    return xhr;

  }

  // sends a request, optional bool sync param provides synchronous request
  o.send = function(url, sync) {

    var req;

    if (o.error.length == 0) {
      if (sync) {

        // synchronous request
        req = sendSync(url);

      } else {

        // add asynchronous request to queue
        req = new HttpRequest(o, url);
        o.queue.push(req);
        req.raiseEvent(1);

        // raise queue start if queue was empty
        if (o.queue.length == 1) {
          o.log('queue start');
          if (o.onQueueStart) {o.onQueueStart();}
          o.poll();
        }

      }
    }

  }

  // calls window.setTimeout on itself checking for requests in the queue to pick up
  o.poll = function() {

    // ensure queue isn't empty and no requests are currently loading
    if (o.queue.length > 0) {
      if (o.xhr.readyState == 0 || o.xhr.readyState == 4) {

        // pick up next request in queue
        o.xhr.open('GET', o.queue[0].url, true);
        o.xhr.setRequestHeader('User-Agent', '(' + userAgent + ')');

        // callback handler
        o.xhr.onreadystatechange = function() {
          if (o.queue.length > 0 && o.xhr.readyState == 4) {

            // handle returned request
            handleReturnedRequest(o.queue[0]);

            // remove request from queue
            o.queue.shift().raiseEvent(2);

            // handle queue end
            if (o.queue.length == 0) {
              o.log('queue end');
              if (o.onQueueEnd) {o.onQueueEnd();}
            }

          }
        }

        // send request
        o.xhr.send(null);

      }
    }

    // call self if queue not empty
    if (o.queue.length > 0) {window.setTimeout(instanceName + '.poll();', 100);}

  }

  // empties queue
  o.clear = function() {

    while (o.queue.length > 0) {o.queue.shift().cancel();}

    o.log('queue cleared');
    o.log('queue end');

    if (o.onQueueEnd) {o.onQueueEnd();}

  }

  // returns next id increment for request object in queue
  o.getNextRequestId = function() {
    return ++currentRequestId;
  }

  // handles a request upon its return
  handleReturnedRequest = function(req) {

    if (req.http.xhr.status == 200) {
      // request was successful
      req.raiseEvent(3);
    } else {
      // request raised error
      req.setError('Could not connect');
    }

  }

  // sends a synchronous request
  sendSync = function(url) {

    // if queue is empty use its xhr, otherwise create one
    var xhr = (o.queue.length == 0 ? o.xhr : getXhr());
    var req = new HttpRequest(o, url, xhr);

    // send request
    xhr.open('GET', req.url, false);
    xhr.setRequestHeader('User-Agent', '(' + userAgent + ')');
    xhr.send(null);

    // handle returned request
    handleReturnedRequest(req);

  }

  // internal class for request object
  HttpRequest = function(http, url, xhr) {

    var o = this
    var active = true;

    o.http = http;
    o.id = o.http.getNextRequestId(); // incremental id
    o.url = url; // requested url
    o.status = 0; // http status code
    o.text = ''; // text returned by request
    o.xml = null; // xml returned by request (nb: json > xml, use it if possible)

    o.add = o.http.onRequestAdd; // event handler for request add
    o.remove = o.http.onRequestRemove; // event handler for request remove
    o.load = o.http.onRequestLoad; // event handler for request load
    o.error = o.http.onRequestError; // event handler for request error

    if (!xhr) {xhr = o.http.xhr;}

    // handles various events throughout a request's different states
    o.raiseEvent = function(event) {
      switch (event) {

        case 1 : // request added to queue
          o.log('add');
          if (o.add) {o.add();}
          break;

        case 2 : // request removed from queue
          o.log('remove');
          if (o.remove) {o.remove();}
          break;

        case 3 : // request successfully loaded
          if (!isNaN(xhr.status)) {o.status = xhr.status;}
          o.text = xhr.responseText;
          o.xml = xhr.responseXML;
          o.log('load');
          if (o.load) {o.load();}
          break;

        case 4 : // request raised an error
          if (!isNaN(xhr.status)) {o.status = xhr.status;}
          o.log('error');
          if (o.error) {o.error();}
          break;

        case 5 : // request cancelled
          o.log('cancel');
          o.raiseEvent(2);

        default :
          break;

      }
    }

    // raises an error
    o.setError = function(msg) {
      o.text = msg;
      o.raiseEvent(4);
    }

    // cancels the request
    o.cancel = function() {
      active = false;
      o.raiseEvent(5);
    }

    // internal log formatting
    o.log = function(msg) {

      var output = '';

      output += '[req.id : ' + o.id + ']\n';
      output += '[req.url.substr(0, 50) : ' + o.url.substr(0, 50) + ']\n';
      output += '[req.log.msg : ' + msg + ']\n';
      output += '[req.http.queue.length : ' + o.http.queue.length + ']\n';
      output += '[req.active : ' + active.toString() + ']\n';
      output += '[req.status : ' + o.status + ']\n';
      output += '[req.text.substr(0, 50) : ' + o.text.substr(0, 50) + ']\n';

      o.http.log(output);

    }

  }

  // internal logging
  o.log = function(msg) {return msg;}

}
