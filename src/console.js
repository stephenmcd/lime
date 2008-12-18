
/**********************************************************************

	provides an in-browser console tool for js development
	
**********************************************************************/

//Base.require('Json');
//Base.require('Session');

function Console(instanceName) {

	var o = this;
	var consoleForm = null; // the console's dom object
	var historyMax = 40; // max num of items in console history
	var sessionSet = false;
	var on = false;

	// bool property used for specifying whether console will attach itself
	// to all base members when first loaded
	o.attachOnLoad = true;
	o.history = [];
									
	// evaluates strings entered thru console
	o.run = function(input) {

		var output = '';

		// add to history
		setHistory(input);
		
		// eval
		output = Base.run(input);

		// determine return string
		switch (Base.getType(output)) {

			case 'alien' : // non js objects cannot be serialized
				output = 'null';
				break;

			case 'object' :
				if (Base.getType(output) == 'object') {
					if (typeof output.message != 'undefined') {
						// return message if message object returned from Base.run()
						output = output.message;
					} else if (typeof Base.Json != 'undefined') {
						// serialize object returned
						output = Base.Json.serialize(output);
					}
				}
				break;
				
			default :
				output = String(output);
				break;
				
		}

		// echo output
		o.echo(output);
		
	}

	// writes a message to the console display
	o.echo = function(msg) {

		// attempt start
		o.start();

		if (consoleForm) {
			// add message
			try {
				consoleForm.consoleOut.value += msg.replace(/[\t]/g, ' ') + '\n\n';
				o.scrollDown();
			}
			catch (err) {}
			try {consoleForm.consoleIn.focus();}
			catch (err) {}
		} else if (on) {
			// if console has been enabled yet console dom object is unavailable, alert message
			alert(msg);
		}
		
	}
	
	// clears the console display
	o.clear = function() {
		o.start();
		if (consoleForm) {consoleForm.consoleOut.value = '';}
		return '';
	}

	// attaches echo calls to log calls of object parameter
	// the logic is ugly so i've attempted to obfuscate it, sorry
	o.attachTo = function(n) {
		var o=eval(n),f='function',l='',r='return',i=-1,e=instanceName+'.echo';if(Base.getType(o.log)==f){l=String(o.log);i=l.indexOf(r);}
		return Base.run(n+'.log='+(i==-1?f+'(s){'+e+'(s);}':l.substr(0,i)+e+'('+l.substr(i+6).substr(0,l.substr(i+6).lastIndexOf(';'))+');'+l.substr(i)));
	}

	// shows/hides the console
	o.toggle = function() {

		on = !on;
		o.start();

		if (consoleForm) {
			consoleForm.style.display = on ? 'block' : 'none'
			o.scrollDown();
		}

	}

	// attempts to start the console
	o.start = function() {

		if (!consoleForm) {

			// create the console dom object
			consoleForm = document.createElement('form');
			consoleForm.className = 'console';
			consoleForm.style.display = 'none';
			//consoleForm.style.opacity = '.10';
			consoleForm.innerHTML = ['<textarea name="consoleOut" class="consoleOut"></textarea><br />',
				'<select name="consoleHistory" class="consoleHistory"><option value="">Console History</option></select>',
				'<select name="consoleMembers" class="consoleMembers"><option value="">Base Members</option></select>',
				'<input type="text" name="consoleIn" class="consoleIn" value="" />',
				'<input type="submit" class="consoleButton" value=">>" />'].join('');
			document.getElementsByTagName('body')[0].appendChild(consoleForm);

			// set history and add history tool handler
			setHistory();
			consoleForm.consoleHistory.onchange = function() {
				this.form.consoleIn.value = this[this.selectedIndex].value;
				this.selectedIndex = 0;
			}

			// add the member list to the member tool and set the change handler
			setMembers(instanceName.substr(0, instanceName.indexOf('.')));
			consoleForm.consoleMembers.onchange = function() {
				this.form.consoleIn.value = this[this.selectedIndex].value;
				this.selectedIndex = 0;
			}

			// add the console submit handler
			consoleForm.onsubmit = function() {
				o.run(this.consoleIn.value);
				this.consoleIn.value = '';
				return false;
			}

			// send a welcome message
			o.echo('Welcome to ' + instanceName);

		}

	}
	
	// attempts to scroll the console to the end of the display
	o.scrollDown = function(isTimeout) {

		if (consoleForm) {
			try {
				consoleForm.consoleOut.scrollTop = consoleForm.consoleOut.scrollHeight;
			} catch (err) {}
		}

		// create a small delay as consoleForm.consoleOut.scrollHeight is sometimes accessed
		// slightly earlier than the end of a large message being added to the display
		if (!isTimeout) {
			window.setTimeout(instanceName + '.scrollDown(true);', 100);
		}

	}

	// updates the history tool
	setHistory = function(input) {

		var sessionData = '';

		// check session for existing history
		if (!sessionSet && typeof Base.Session != 'undefined' && Base.Json != 'undefined') {
			sessionData = Base.Session.get(instanceName + '.history');
			if (sessionData.length > 0) {
				o.history = Base.Json.parse(sessionData).concat(o.history);
			}
			sessionSet = true;
		}

		// add new entry to history
		if (Base.getType(input) == 'string' && input.length > 0) {
			if (o.history.length >= historyMax) {
				o.history.length = (historyMax - 1);
			}
			o.history.unshift(input);
		}

		// store history in session
		if (sessionSet) {
			Base.Session.set(instanceName + '.history', Base.Json.serialize(o.history));
		}

		// add history to display
		if (consoleForm && consoleForm.consoleHistory) {
			consoleForm.consoleHistory.length = o.history.length + 1;
			for (var i = 0; i < o.history.length; i++) {
				consoleForm.consoleHistory[i + 1].value = o.history[i];
				consoleForm.consoleHistory[i + 1].text = o.history[i];
			}
		}

	}

	// puts members into the member tool
	setMembers = function(objName) {

		// get Base members
		var members = getMembers(objName);

		if (consoleForm && consoleForm.consoleHistory) {
			for (var i = 0; i < members.length; i++) {
				consoleForm.consoleMembers.length++;
				consoleForm.consoleMembers[consoleForm.consoleMembers.length - 1].text = members[i];
				consoleForm.consoleMembers[consoleForm.consoleMembers.length - 1].value = members[i];
			}
		}

	}

	// reflects an object returning an array of its members
	getMembers = function(objName) {
	
		var objVal = eval(objName);
		var members = [];
		var valid = true;
		
		for (var k in objVal) {
			if (Base.getType(objVal[k]) == 'object') {
				// attempt attach
				if (o.attachOnLoad && typeof objVal[k].log != 'undefined') {
					o.attachTo(objName + '.' + k);
				}
				// add object members recursively
				members = members.concat(getMembers(objName + '.' + k));
			} else {
				// add member
				members[members.length] = objName + '.' + k;
				if (Base.getType(objVal[k]) == 'function') {
					// add brackets to function names
					members[members.length - 1] += '()';
				}
			}
		}
		
		return [objName].concat(members.sort(function(a, b) {return (a < b ? -1 : 1);}));
		
	}

}
