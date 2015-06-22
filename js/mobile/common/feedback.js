/**
 * @desc M版返回顶部反馈功能组模块
 *
 * @created 2015.5.4
 * @update 2015.5.4
 */

define( 'feedback', function () {

    var feedbackGroup = function () {
        var _this = this,
            config = {
                wrapper: window,
                callBack: null
            },
            sFragmentHtml = '';

        //计算窗口滚动条的位置
        var getScrollOffsets = function( w ) {
            w = w || window;

            //除了IE8及更早的版本以外, 其他浏览器都能用
            if(w.pageXOffset != null) return {x: w.pageXOffset, y: w.pageYOffset};

            // 对标准模式下IE（或任何浏览器）
            var d = w.document;
            if(document.compatMode == "CSS1Compat")
                return {x: d.documentElement.scrollLeft, y:d.documentElement.scrollTop};

            // 对怪异模式下的浏览器
            return {x: d.body.scrollLeft, y: d.body.scrollTop};
        };

        // 查询窗口的视口尺寸
        var getViewportSize = function( w ) {
            w = w || window;

            //除了IE8及更早版本以外，其他浏览器都能用
            if(w.innerWidth != null) return {w: w.innerWidth, h:w.innerHeight};

            // 对标准模式下的IE（或任何浏览器）
            var d = w.document;
            if(document.compatMode =="CSS1Compat")
                return { w: d.documentElement.clientWidth,
                    h: d.documentElement.clientHeight };

            // 对怪异模式下的浏览器
            return {w: d.body.clientWidth, h: body.clientHeight};
        };

        // 元素的右上坐标
        var getElTopRight = function( el ) {
            el = el || window;

            var box = el.getBoundingClientRect(); //获取在视口坐标的位置
            var offsets = getScrollOffsets();

            return {top: box.top + offsets.y, right: box.right + offsets.x};
        };

        // 返回顶部事件出初始化
        var initEvent = function(){
                var backTop = $('.gotoTop'),
                    viewSize = getViewportSize(),
                    timer = null,
                    istop = true;

                backTop.on('click', function(event){
                    var evt = event|| window.Event,
                        target = evt.target || evt.srcElement,
                        offsets = getScrollOffsets();

                    if (window.event) {
                        evt.cancelBubble=true;
                    } else {
                        evt.stopPropagation();
                    }

                    timer = setInterval(function(){
                        var top = document.documentElement.scrollTop||document.body.scrollTop,
                            clientHeight = viewSize.h,
                            ispeed = Math.floor(-top / 6);

                        document.documentElement.scrollTop = document.body.scrollTop = top + ispeed;

                        if(0 === top) clearInterval(timer);

                        istop = true;

                    }, 30);
                });

                window.onscroll = function(){
                    var itop = document.documentElement.scrollTop||document.body.scrollTop,
                        clientHeight = viewSize.h;

                    if(itop >= clientHeight){
                        backTop.css({display: 'block'});
                    }else{
                        backTop.css({display: 'none'});
                    }

                    if(!istop) clearInterval(timer);

                    istop = false;
                };

            };

        return {
            init: function (cfg) {
                _.extend(config, cfg);
                initEvent();
            }
        };
    };

    return feedbackGroup();
});
