/**
 * @fileoverview form提交ajax化组件
 * @author houyulei
 */
define(function(require) {
	var Class, Uri, secret;

	Uri = require('uri');
	// secret = require('modules/yinyuetai/secret');
	/**
	 * @name AjaxForm
	 * @class 1.将form提交变为ajax提交 2.自动处理跨域请求 3.可用于图片/附件上传等情景
	 * @param {Object}
	 *            element 需要ajax化的form表单
	 * @param {Function}
	 *            options.onRequest 请求前会执行的方法，当该方法return true时，会发出请求，return
	 *            false时，不会发出请求。因此可以在此方法内进行一些表单验证操作。
	 * @param {Function}
	 *            options.onComplete 请求结束后的回调函数，类似于ajax请求完成的回调函数。
	 * @example new AjaxForm($('form'),{ onRequest : function(){return true};
	 *          onComplete : function(data){alert(data)}})
	 */
	Class = Backbone.View.extend({
		options : {
			secretName : 'des',
			secretParam : function() {
				return [];
			},
			onRequest : function() {
				return true;
			},
			onComplete : function(data) {
			}
		},
		initialize : function(options) {
			var form, frameId;

			form = this.$el;

			// 一个跨域的form表单，多次提交只产生一个iframe element
			if (form.attr('target') && $(form.attr('target')).length != 0) {
				return;
			}

			if (new Uri(form.attr('action')).host() !== ''
					|| form.find('[type=file]').length !== 0) {
				frameId = 'f' + new Date().getTime();
				form.attr('target', frameId);
				this.iframe = iframe.call(this, frameId);
			} else {
				ajax.call(this);
			}
		}
	});

	function ajax() {
		var form, options;

		form = this.$el;
		options = this.options;

		form.submit(function(e) {
			e.preventDefault();
			// encrypt(form, secret[options.secretName].apply(window,
			// options.secretParam()));
			$.ajax({
				type : 'POST',
				url : form.attr('action'),
				data : form.serialize(),
				beforeSend : function() {
					if (options.onRequest.call(form)) {
						return true;
					} else {
						return false;
					}
				},
				success : function(data) {
					options.onComplete.call(form, data);
				}
			});
		});
	}

	function iframe(frameId) {
		var form, options, iframe, innerText, secretName, secretParam, requesting;// requesting
		// 防止重复提交的变量
		form = this.$el;
		options = this.options;
		secretName = options.secretName;
		secretParam = options.secretParam;

		$('<input />').attr({
			type : 'hidden',
			name : 'cross_post',
			value : '1'
		}).appendTo(form);

		iframe = $('<iframe name=' + frameId + '/>').attr({
			id : frameId,
			src : 'about:blank'
		}).css('display', 'none').appendTo(document.body);

		iframe.on('load', function() {
			requesting = false;
			try {// 如果后台没有作跨域处理，则需手动触发onComplete
				var body = $('#' + frameId)[0].contentWindow.document.body;
				innerText = body.innerText;
				if (!innerText) {
					innerText = body.innerHTML;
				}
				if (innerText) {
					options.onComplete.call(form, $.parseJSON(innerText));
				}
			} catch (e) {
				options.onComplete.call(form);
			}
		});

		form.on('submit', submit);

		function submit(e) {
			e.preventDefault();
			if (options.onRequest.call(form)) {
				if (requesting) {
					return false;
				}
				requesting = true;
				form.off('submit');
				// 加密处理
				// encrypt(form, secret[secretName].apply(window,
				// secretParam()));
				form.submit();
				form.on('submit', submit);
			}
		}

		return iframe;
	}

	// function encrypt(element, secret) {
	// $.each(secret, function(key, value) {
	// var $item = element.find('[name=' + key + ']');
	// if ($item.length === 0) {
	// $('<input />').attr({
	// type : 'hidden',
	// name : key,
	// value : value
	// }).appendTo(element);
	// } else {
	// $item.val(value);
	// }
	// });
	// }

	function AjaxForm(element, options) {
		options = options || {};
		options.el = element;
		return new Class(options);
	}

	return AjaxForm;
});