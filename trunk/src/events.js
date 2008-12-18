
/**********************************************************************

	provides cross-browser handling for adding and raising dom events
	
**********************************************************************/

function Events(instanceName) {

	var o = this;
	var eventNames = [];

	// adds and event handler
	o.add = function(obj, eventName, handler) {

		var currentHandler = null;
		var id = Base.getIdAttr(obj); // ensure dom object has id
		var boundToObj = false;

		o.log(instanceName + '.' + 'add', id + '.' + eventName, handler);

		// create object for all events of this type if not yet created
		if (!eventNames[eventName]) {eventNames[eventName] = {};}

		// create array of handlers for this dom object if not yet created
		if (!eventNames[eventName][id]) {eventNames[eventName][id] = [];}

		// add inline handler if present
		currentHandler = eval('obj.' + eventName);
		if (currentHandler) {
			if (String(currentHandler) != String(o.raise)) {
				eventNames[eventName][id].push(currentHandler);
			} else {
				boundToObj = true;
			}
		}

		// point dom object's true handler to the Event class if not already done
		if (!boundToObj) {eval('obj.' + eventName + ' = o.raise');}

		// add event handler
		eventNames[eventName][id].push(handler);

	}

	// raises an event and calls any handlers
	o.raise = function(eventObj) {

		var eventName = 'on';
		var id = this.getAttribute('id');
		var handlers;
		var returnOne = false;
		var returnAll = true;

		// determine event type
		if (!eventObj && window.event) {eventObj = window.event;}
		if (eventObj) {eventName += eventObj.type;}

		// go thru and run handlers for this dom object's event
		if (eventNames[eventName] && eventNames[eventName][id]) {
			handlers = eventNames[eventName][id];
			for (var i = 0; i < handlers.length; i++) {
				try {

					// run handler
					returnOne = Base.run(handlers[i]);
					
					// determine overall return bool
					if (Base.getType(returnOne) == 'boolean') {
						returnAll = (returnAll && returnOne);
					}
					o.log(instanceName + '.' + 'raise', id + '.' + eventName, handlers[i]);

				} catch (err) {}
			}
		}

		return returnAll;

	}

	// internal logging
	o.log = function(member, eventName, handler) {
		return member + '(' + eventName + ') : ' + String(handler);
	}

}
