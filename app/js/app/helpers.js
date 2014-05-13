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


	return {
		urlParams: urlParams,
		getCookie: getCookie,
	}
});