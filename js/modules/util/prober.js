/**
 * @fileoverview 浏览器探测,不建议使用;建议使用IE探测detector-ie 文档见http://aralejs.org/detector/
 * @author aralejs
 */
define(function(require, exports) {

	//Thanks :
	// - https://github.com/aralejs/detector/blob/master/src/detector.js
	// - http://article.yeeyan.org/view/heart5/19211

	var prober, userAgent, external, re_msie, toString, DEVICES, OS, ENGINE, BROWSER;

	prober = {};
	userAgent = navigator.userAgent || '';
	external = window.external;
	re_msie = /\b(?:msie|ie) ([0-9.]+)/;
	toString = Object.prototype.toString;

	function each(object, factory, argument) {
		var i, len;

		for (i = 0, len = object.length; i < len; i++) {
			if (factory.call(object, object[i], i) === false) {
				break;
			}
		}
	};

	//硬件设备信息识别表达式
	DEVICES = [
		['nokia', function(ua) {
			if (ua.indexOf('nokia ') !== -1) {
				return /\bnokia ([0-9]+)?/;
			} else if (/\bnokia[\d]/.test(ua)) {
				return /\bnokia(\d+)/;
			} else {
				return 'nokia';
			}
		}],
		['wp', function(ua) {
			return ua.indexOf('windows phone ') !== -1 ||
					ua.indexOf('xblwp') !== -1 ||
					ua.indexOf("zunewp") !== -1 ||
					ua.indexOf("windows ce") !== -1;
		}],
		['mi', function(ua) {
			if (ua.indexOf('mi-one plus') !== -1) {
				return {
					version : '1s'
				};
			} else {
				return /\bmi ([0-9.as]+)/;
			}
		}],
		['playstation', function(ua) {
			return (ua.indexOf('playstation') !== -1 ||
					ua.indexOf('wii') !== -1) &&
					ua.indexOf('windows') == -1;
		}],
		['blackberry', function(ua) {
			return (ua.indexOf('blackberry') !== -1 ||
					ua.indexOf('playbook ') !== -1 ||
					ua.indexOf('rim') !== -1 ||
					ua.indexOf('tablet') !== -1 ||
					ua.indexOf('bb10') !== -1) &&
					ua.indexOf('windows') == -1;
		}],
		['pc', 'windows'],
		['ipad', 'ipad'],
		['ipod', 'ipod'],
		['iphone', 'iphone'],
		['mac', 'macintosh'],
		['aliyun', 'aliyunos'],
		['meizu', /\bm([0-9]+)\b/],
		['nexus', /\bnexus ([0-9.]+)/],
		['android', 'android']
	];

	//操作系统信息识别表达式
	OS = [
		['wp', function(ua) {
			if (ua.indexOf('windows phone ') !== -1) {
				return /\bwindows phone (?:os )?([0-9.]+)/;
			} else if (ua.indexOf("xblwp") !== -1) {
				return /\bxblwp([0-9.]+)/;
			} else if (ua.indexOf("zunewp") !== -1) {
				return /\bzunewp([0-9.]+)/;
			}
			return 'windows phone';
		}],
		['windows', /\bwindows nt ([0-9.]+)/],
		['macosx', /\bmac os x ([0-9._]+)/],
		['ios', /\bcpu(?: iphone)? os ([0-9._]+)/],
		['yunos', /\baliyunos ([0-9.]+)/],
		['android', /\bandroid[ -]([0-9.]+)/],
		['chromeos', /\bcros i686 ([0-9.]+)/],
		['linux', 'linux'],
		['windowsce', /\bwindows ce(?: ([0-9.]+))?/],
		['symbian', /\bsymbianos\/([0-9.]+)/],
		['blackberry', 'blackberry']
	];

	//渲染引擎信息识别表达式
	ENGINE = [
		['trident', re_msie],
		['webkit', /\bapplewebkit\/([0-9.+]+)/],
		['gecko', /\bgecko\/(\d+)/],
		['presto', /\bpresto\/([0-9.]+)/]
	];

	//浏览器信息识别表达式
	BROWSER = [
		['sg', / se ([0-9.x]+)/],
		['mx', function(ua) {
			try {
				if (external && (external.mxVersion || external.max_version)) {
					return {
						version : external.mxVersion || external.max_version
					};
				}
			} catch (e) {}
			return /\bmaxthon(?:[ \/]([0-9.]+))?/;
		}],
		['qq', /\bqqbrowser\/([0-9.]+)/],
		['green', 'greenbrowser'],
		['tt', /\btencenttraveler ([0-9.]+)/],
		['lb', function(ua) {
			if (ua.indexOf('lbbrowser') === -1) {
				return false;
			}
			var version = '-1';
			try {
				if (external && external.LiebaoGetVersion) {
					version = external.LiebaoGetVersion();
				}
			} catch (e) {}
			return {
				version : version
			};
		}],
		['tao', /\btaobrowser\/([0-9.]+)/],
		['fs', /\bcoolnovo\/([0-9.]+)/],
		['sy', 'saayaa'],
		// 有基于 Chromniun 的急速模式和基于 IE 的兼容模式。必须在 IE 的规则之前。
		['baidu', /\bbidubrowser[ \/]([0-9.x]+)/],
		['ie', re_msie],
		['mi', /\bmiuibrowser\/([0-9.]+)/],
		// Opera 15 之后开始使用 Chromniun 内核，需要放在 Chrome 的规则之前。
		['opera', function(ua) {
			var re_opera_old = /\bopera.+version\/([0-9.ab]+)/;
			var re_opera_new = /\bopr\/([0-9.]+)/;
			return re_opera_old.test(ua) ? re_opera_old : re_opera_new;
		}],
		['chrome', / (?:chrome|crios|crmo)\/([0-9.]+)/],
		// Android 默认浏览器。该规则需要在 safari 之前。
		['android', function(ua) {
			if (ua.indexOf('android') === -1) {
				return;
			}
			return /\bversion\/([0-9.]+(?: beta)?)/;
		}],
		['safari', /\bversion\/([0-9.]+(?: beta)?)(?: mobile(?:\/[a-z0-9]+)?)? safari\//],
		['firefox', /\bfirefox\/([0-9.ab]+)/],
		['uc', function(ua) {
			return ua.indexOf('ucbrowser') !== -1 ? /\bucbrowser\/([0-9.]+)/ : /\bucweb([0-9.]+)/;
		}]
	];

	//解析使用Trident内核浏览器的"浏览器模式"和"文档模式"信息
	function ieMode(ua) {
		var m, engineMode, engineVersion, browserMode, browserVersion, compatible, v_mode, v_version;

		if (!re_msie.test(ua)) {
			return null;
		}

		compatible = false;

		if (ua.indexOf('trident/') !== -1) {
			m = /\btrident\/([0-9.]+)/.exec(ua);
			if (m && m.length >= 2) {
				engineVersion = m[1];
				v_version = m[1].split('.');
				v_version[0] = parseInt(v_version[0], 10) + 4;
				browserVersion = v_version.join('.');
			}
		}

		m = re_msie.exec(ua);
		browserMode = m[1];
		v_mode = m[1].split('.');
		if ('undefined' === typeof browserVersion) {
			browserVersion = browserMode;
		}
		v_mode[0] = parseInt(v_mode[0], 10) - 4;
		engineMode = v_mode.join('.');
		if ('undefined' === typeof engineVersion) {
			engineVersion = engineMode;
		}

		return {
			browserVersion : browserVersion,
			browserMode : browserMode,
			engineVersion : engineVersion,
			engineMode : engineMode,
			compatible : engineVersion !== engineMode
		};
	};

	function matchHandler(name, expression, ua) {
		var expr, info, t, m;

		if (typeof ua === 'undefined') {
			ua = userAgent;
		}

		expr = toString.call(expression) === '[object Function]' ? expression.call(null, ua) : expression;
		if (!expr) {
			return null;
		}

		info = {
			name : name,
			version : '-1',
			codename : ''
		};
		t = toString.call(expr);

		if (expr === true) {
			return info;
		} else if (t === '[object String]') {
			if (ua.indexOf(expr) !== -1) {
				return info;
			}
		} else if (toString.call(expr) === '[object Object]') {
			if (expr.hasOwnProperty('version')) {
				info.version = expr.version;
			}
			return info;
		} else if (expr.exec) {
			m = expr.exec(ua);
			if (m) {
				if (m.length >= 2 && m[1]) {
					info.version = m[1].replace(/_/g, '.');
				} else {
					info.version = '-1';
				}
				return info;
			}
		}
	};

	function getUAInfoHandler(ua, patterns, factory) {
		var info;

		info = {
			name : 'na',
			version : '-1'
		};

		each(patterns, function(pattern) {
			var temp;

			temp = matchHandler(pattern[0], pattern[1], ua);
			if (temp) {
				info = temp;
				return false;
			}
		});

		factory(info.name, info.version);
	};

	//解析UA，得到device, os, engine, browser信息
	function parse(ua) {
		var o, ieCore;

		o = {};
		ua = (ua || '').toLowerCase();

		getUAInfoHandler(ua, DEVICES, function(name, version) {
			var v;

			v = parseFloat(version);
			o.device = {
				name : name,
				version : v,
				fullVersion : version
			};
			o.device[name] = v;
		});

		getUAInfoHandler(ua, OS, function(name, version) {
			var v;

			v = parseFloat(version);
			o.os = {
				name : name,
				version : v,
				fullVersion : version
			};
			o.os[name] = v;
		});

		ieCore = ieMode(ua);

		getUAInfoHandler(ua, ENGINE, function(name, version) {
			var mode, v;

			mode = version;
			if (ieCore) {
				version = ieCore.engineVersion || ieCore.engineMode;
				mode = ieCore.engineMode;
			}

			v = parseFloat(version);
			o.engine = {
				name : name,
				version : v,
				fullVersion : version,
				mode : parseFloat(mode),
				fullMode : mode,
				compatible : ieCore ? ieCore.compatible : false
			};
			o.engine[name] = v;
		});

		getUAInfoHandler(ua, BROWSER, function(name, version) {
			var mode, v;

			mode = version;
			if (ieCore) {
				if (name === 'ie') {
					version = ieCore.browserVersion;
				}
				mode = ieCore.browserMode;
			}

			v = parseFloat(version);
			o.browser = {
				name : name,
				version : v,
				fullVersion : version,
				mode : parseFloat(mode),
				fullMode : mode,
				compatible : ieCore ? ieCore.compatible : false
			};
			o.browser[name] = v;
		});

		return o;
	};

	prober = parse(navigator.userAgent);
	prober.parse = parse;

	return prober;
});