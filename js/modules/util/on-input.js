/**
 * @fileoverview 监听文本输入，兼容包括IE6的全部主流浏览器
 * @author houyulei
 */
define(function() {
	// Thanks :
	// http://www.cnblogs.com/rubylouvre/archive/2013/02/17/2914604.html
	// https://developer.mozilla.org/zh-CN/docs/DOM/window.oninput
	// http://msdn.microsoft.com/en-us/library/ie/ms536956(v=vs.85).aspx
	// http://stackoverflow.com/questions/15516218/how-to-handle-undo-redo-event-in-javascript

	/**
	 * @name onInput
	 * @desc 兼容主流浏览器的监听文本输入事件
	 * 
	 * @param {DOM}
	 *            element
	 * 
	 * @param {Function}
	 *            callback
	 * 
	 */
	function onInput(element, callback) {
		var $element = $(element);
		callback = callback || $.noop;

		$element.on('input', function() {
			callback($element);
		});

		$element.on('changValue', function() {
			if (!('\v' == 'v')) { // IE8-
				callFn();
			}
		});

		if (window.attachEvent && !window.addEventListener) {
			$element.on('propertychange', function(e) {
				if (window.event.propertyName == 'value') { // only care value
					callFn();
				}
			});
		}

		if (window.addEventListener && !window.atob) {
			$element.on('keydown', function(e) { // fixed IE9 backspace
				// delete ctrl-z event
				var key = e.keyCode;

				if (key == 8 || key == 46 || (key == 90 && e.ctrlKey)) {
					callFn();
				}
			});

			$element.on('cut', function() { // fixed IE9 contextmenu -> cut
				callFn();
			});

			$element.on('contextmenu', function() { // fixed IE9 contextmenu ->
				// undo cut paste delete
				// event
				callFn();
			});
		}

		function callFn() {
			setTimeout(function() {
				callback($element);
			}, 1);
		}
	}

	return onInput;
});
