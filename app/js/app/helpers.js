define([], function() {
	var urlParams;
	(window.onpopstate = function () {
	    var match,
	        pl     = /\+/g,  // Regex for replacing addition symbol with a space
	        search = /([^&=]+)=?([^&]*)/g,
	        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
	        query  = window.location.search.substring(1);

	    urlParams = {};
	    while (match = search.exec(query))
	       urlParams[decode(match[1])] = decode(match[2]);
	})();

	function getCookie(c_name) {
	    var c_value = document.cookie;
	    var c_start = c_value.indexOf(" " + c_name + "=");

	    if (c_start == -1)
	        c_start = c_value.indexOf(c_name + "=");

	    if (c_start == -1)
	    {
	        c_value = null;
	    }
	    else
	    {
	        c_start = c_value.indexOf("=", c_start) + 1;
	        var c_end = c_value.indexOf(";", c_start);

	        if (c_end == -1)
	            c_end = c_value.length;

	        c_value = unescape(c_value.substring(c_start,c_end));
	    }

	    return c_value;
	}

	String.prototype.endsWith = function(str) {
	    return this.indexOf(str) == this.length - str.length;
	};

	String.prototype.startsWith = function(str) {
	    return this.substr(0, str.length) == str;
	};

	function generateGuid() {
	    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	        return v.toString(16);
	    });
	}

	function clearCookie(name) {
		document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}

	return {
		urlParams: urlParams,
		getCookie: getCookie,
		generateGuid: generateGuid,
		clearCookie: clearCookie,
	}
});