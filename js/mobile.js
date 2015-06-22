require.config({
    baseUrl: ".",
    paths: {
        // Libraries
        'jquery.lazyload': 'js/lib/jquery.lazyload-1.8.4-min',
        'jquery.touchswap': 'js/lib/jquery.touchswap-1.6.3-min',
        'jquery.bigcolorpicker': 'js/lib/jquery.bigcolorpicker.min',
        juicer: 'js/lib/juicer-0.6.5',
        cookie: 'js/modules/util/cookie',
        prober: 'js/modules/util/prober',
        //M版临时使用
        ajax: 'js/mobile/common/ajax',
        ajaxform: 'js/modules/util/ajaxform',
        'on-input': 'js/modules/util/on-input',
        'detector-ie': 'js/modules/detector-ie',
        uri: 'js/lib/uri',
        util: 'js/mobile/common/util',
        querymodel: 'js/modules/estar/querymodel',

        // store.set('username', 'marcus') Store 'marcus' at 'username'
        // store.get('username') Get 'username'
        // store.remove('username') Remove 'username'
        // store.clear() Clear all keys
        // store.set('user', { name: 'marcus', likes: 'javascript' }) Store an
        // object literal - store.js uses JSON.stringify under the hood
        // var user = store.get('user') Get the stored object - store.js uses
        // JSON.parse under the hood
        // store.getAll().user.name == 'marcus' Get all stored values
        store: 'js/lib/store.min',

        dialog: 'js/modules/widget/dialog/dialog',
        tinyscrollbar: 'js/modules/widget/tinyscrollbar',
        swfobject: 'js/lib/swfobject-2.2-min',
        drag: 'js/modules/interaction/drag',
        scrollbar: 'js/modules/widget/tinyscrollbar',
        placeholder: 'js/modules/widget/placeholder',
        fastclick: 'js/lib/fastclick.1.0.0',
        urlconfig: 'js/modules/estar/urlconfig',
        appconfig: 'js/modules/estar/appconfig',
        audiojs: 'js/lib/audiojs/audio.min',
        webuploader: 'js/lib/webuploader/webuploader-0.1.5',
        estarui: 'js/modules/widget/estarui/estarui-amd',
        ueditor: 'js/modules/widget/ueditor/ueditor-amd',
        morris: 'js/lib/morris/morris.min',
        json2: 'js/lib/json2',
        datePicker: 'js/modules/widget/My97DatePicker/WdatePicker',
        player: 'js/modules/widget/ckplayer/player',
        turn: 'js/modules/widget/turn',
        slider: 'js/modules/widget/slider',
        comment: 'js/modules/estar/comment'
    },

    shim: {
        juicer: {
            exports: 'juicer'
        },
        uri: {
            exports: 'Uri'
        },
        swfobject: {
            exports: 'swfobject'
        },
        audiojs: {
            exports: 'audiojs'
        },
        'js/modules/widget/ueditor/ueditor.all': {
            deps: ['js/modules/widget/ueditor/ueditor.config']
        },
        'js/modules/widget/ueditor/lang/zh-cn/zh-cn': {
            deps: ['js/modules/widget/ueditor/ueditor.all']
        },
        morris: {
            exports: 'Morris',
            deps: ['js/lib/morris/raphael-min']
        },
        json2: {
            exports: 'JSON'
        },
        'js/modules/widget/ckplayer/ckplayer/ckplayer': {
            exports: 'CKobject',
            deps: ['js/modules/widget/ckplayer/js/offlights']
        },
        'js/app/honeybee/commonService': {
            exports: 'CM_EXE'
        },
        'js/app/honeybee/url': {
            exports: 'HB_URL'
        },
        'js/app/schoolclass/url': {
            exports: 'SC_URL'
        }
    }
});

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
