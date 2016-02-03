require.config({
    baseUrl: ".",
    paths: {
        juicer: 'js/lib/juicer-0.6.5',
        cookie: 'js/modules/util/cookie',
        //M版临时使用
        ajax: 'js/mobile/common/ajax',
        ajaxform: 'js/modules/util/ajaxform',
        uri: 'js/lib/uri'
    },

    shim: {
        juicer: {
            exports: 'juicer'
        },
        uri: {
            exports: 'Uri'
        }
    }
});

/*
(function (doc, win) {
    var docEl = doc.documentElement,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = function () {
            var clientWidth = docEl.clientWidth;
            if (!clientWidth) return;
            docEl.style.fontSize = Math.min(20 * (clientWidth / 320),40) + 'px';
        };

    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);
*/
