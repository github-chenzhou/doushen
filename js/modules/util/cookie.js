/**
 * @fileoverview cookie操作
 * @author houyulei
 */
define(function(require, exports) {

	// Thanks :
	// - https://github.com/aralejs/cookie/blob/master/src/cookie.js

	var decode, encode;

	decode = decodeURIComponent; // 解码
	encode = encodeURIComponent; // 编码

	/**
	 * @name get
	 * @desc Returns the cookie value for the given name.
	 * 
	 * @param {String}
	 *            name The name of the cookie to retrieve.
	 * 
	 * @param {Function|Object}
	 *            options (Optional) An object containing one or more cookie
	 *            options: raw (true/false) and converter (a function). The
	 *            converter function is run on the value before returning it.
	 *            The function is not used if the cookie doesn't exist. The
	 *            function can be passed instead of the options object for
	 *            conveniently. When raw is set to true, the cookie value is not
	 *            URI decoded.
	 * 
	 * @return {*} If no converter is specified, returns a string or undefined
	 *         if the cookie doesn't exist. If the converter is specified,
	 *         returns the value returned from the converter.
	 */
	exports.get = function(key, options) {
		var cookies, converter, raw;

		validate(key);
		options = options || {};
		raw = options.raw || false;
		converter = options.converter || function(o) {
			return o;
		};

		cookies = parseCookie(document.cookie, !raw);
		return converter(cookies[key]);
	};

	/**
	 * @name set
	 * @desc Sets a cookie with a given name and value.
	 * 
	 * @param {string}
	 *            name The name of the cookie to set.
	 * 
	 * @param {*}
	 *            value The value to set for the cookie.
	 * 
	 * @param {Object}
	 *            options (Optional) An object containing one or more cookie
	 *            options: path (a string), domain (a string), expires (number
	 *            or a Date object), secure (true/false), and raw (true/false).
	 *            Setting raw to true indicates that the cookie should not be
	 *            URI encoded before being set.
	 * 
	 * @return {string} The created cookie string.
	 */
	exports.set = function(key, value, options) {
		var expires, domain, path, text, date;

		validate(key);
		options = options || {};
		expires = options['expires'];
		domain = options['domain'];
		path = options['path'];

		if (!options['raw']) {
			value = encode(String(value));
		}

		text = key + '=' + value;
		date = expires;

		if (typeof date === 'number') {
			date = new Date();
			date.setDate(date.getDate() + expires);
		}

		if (date instanceof Date) {
			text += '; expires=' + date.toUTCString();
		}

		if (domain && domain.length) {
			text += '; domain=' + domain;
		}

		if (path && path.length) {
			text += '; path=' + path;
		}

		// http://www.oschina.net/question/8676_3423 secure作用
		if (options['secure']) {
			text += '; secure';
		}

		document.cookie = text;
		return text;
	};

	/**
	 * @name remove
	 * @desc Removes a cookie from the machine by setting its expiration date to
	 *       sometime in the past.
	 * 
	 * @param {string}
	 *            name The name of the cookie to remove.
	 * 
	 * @param {Object}
	 *            options (Optional) An object containing one or more cookie
	 *            options: path (a string), domain (a string), and secure
	 *            (true/false). The expires option will be overwritten by the
	 *            method.
	 * 
	 * @return {string} The created cookie string.
	 */

	exports.remove = function(key, options) {
		options = options || {};
		options['expires'] = new Date(0);
		return this.set(key, '', options);
	};

	// 把document.cookie字符串解析为{cookieName : cookieValue}
	function parseCookie(text, shouldDecode) {
		var i, len, cookies, decodeValue, cookieParts, cookieName, cookieValue, cookieNameValue;

		cookies = {};
		decodeValue = shouldDecode ? decode : (function(o) {
			return o;
		});
		cookieParts = text.split(/;\s/g);

		for (i = 0, len = cookieParts.length; i < len; i++) {
			cookieNameValue = cookieParts[i].match(/([^=]+)=/i);
			if (cookieNameValue instanceof Array) {
				try {
					cookieName = decode(cookieNameValue[1]);
					cookieValue = decodeValue(cookieParts[i]
							.substring(cookieNameValue[1].length + 1));
				} catch (e) {
				}
			} else {
				cookieName = decode(cookieParts[i]);
				cookieValue = '';
			}

			if (cookieName) {
				cookies[cookieName] = cookieValue;
			}
		}

		return cookies;
	}

	function validate(key) {
		if (!(key && key.length)) {
			throw new TypeError('Cookie name must be a non-empty string');
		}
	}
});