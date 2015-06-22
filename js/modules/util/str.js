define(function(require, exports, module) {
	module.exports = {
		getLength : function(str) {
			var result = 0;
			var length = str.length;
			while (length--) {
				if (/^[\u0000-\u00ff]$/.test(str.charAt(length))) {
					result += 1;
				} else {
					result += 2;
				}
			}
			return result;
		}
	};
});