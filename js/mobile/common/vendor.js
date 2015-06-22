/**
 * @desc M版vendor模块
 * //获取浏览器特性前缀
 * @created 2015.5.18
 * @update 2015.5.18
 */

 ;(function() {

    var vendor = function () {
        var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
            _elementStyle = document.createElement('div').style,
            transform,
            i = 0,
            l = vendors.length;

        for (; i < l; i++) {
            transform = vendors[i] + 'ransform';
            if (transform in _elementStyle) return vendors[i].substr(0, vendors[i].length - 1);
        }

        return false;
    }();

    function _prefixStyle (style) {
        if ( vendor === false ) return false;
        if ( vendor === '' ) return style;
        return vendor + style.charAt(0).toUpperCase() + style.substr(1);
    }

    var css3TransNames = {};
    _.extend( css3TransNames, {
            transform: _prefixStyle('transform'),
            transition: _prefixStyle('transition'),
            animation: _prefixStyle('animation')
        }
    );

    window.vendor = vendor;
    window.css3TransNames = css3TransNames;
}());