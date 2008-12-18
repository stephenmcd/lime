
/**********************************************************************

	provides simple access to session level variables thru cookies

**********************************************************************/

function Session() {

	var o = this;

	// sets a cookie val
	o.set = function(varName, varValue) {
		document.cookie = escape(varName) + '=' + escape(varValue);
	}

	// gets a cookie val
	o.get = function(varName) {

		var varValue = '';
		var varAt = ('; ' + document.cookie).indexOf('; ' + escape(varName) + '=');

		if (varAt > -1) {
			varAt += (escape(varName).length + 1);
			varValue = unescape(document.cookie.substr(varAt).split(';')[0]);
		}

		return varValue;

	}

}

