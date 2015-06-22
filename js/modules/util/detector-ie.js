/**
 * @fileoverview 根据userAgent判断IE版本。如果针对真实浏览器版本识别，可用于浏览器升级提示，但是为了避免将 IE 内核的浏览器识别为 IE，建议使用 prober
 * @author houyulei
 */
define(function(){
	return {
		// 单个浏览器识别：
		isIE6 : function(){
			return navigator.userAgent.indexOf("MSIE 6.0") !== -1;
		},
		isIE7 : function(){
			return navigator.userAgent.indexOf("MSIE 7.0") !== -1;
		},
		isIE8 : function(){
			return navigator.userAgent.indexOf("MSIE 8.0") !== -1;
		},
		isIE9 : function(){
			return navigator.userAgent.indexOf("MSIE 9.0") !== -1;
		},
		isIE10 : function(){
			return navigator.userAgent.indexOf("MSIE 10.0") !== -1;
		},
		isIE11 : function(){
			return /\btrident\/[0-9].*rv[ :]11\.0/.test(navigator.userAgent);
		},
		// 多个浏览器识别
		isIE678 :function(){ 
			return /\bMSIE [678]\.0\b/.test(navigator.userAgent);
		}
	}
})