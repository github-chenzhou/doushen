/**
 * @desc M版提示框模块
 *
 * @created 2015.5.7
 * @update 2015.5.7
 */

define('tipbox', function () {

    /*
     * @弹出提示层 ( 加载动画(load), 提示动画(tip), 成功(success), 错误(error), )
     * @method  tipBox
     * @description 默认配置参数
     * @time    2014-12-19
     * @param {Number} width -宽度
     * @param {Number} height -高度
     * @param {String} str -默认文字
     * @param {Object} windowDom -载入窗口 默认当前窗口
     * @param {Number} setTime -定时消失(毫秒) 默认为0 不消失
     * @param {Boolean} hasMask -是否显示遮罩
     * @param {Boolean} hasMaskWhite -显示白色遮罩
     * @param {Boolean} clickDomCancel -点击空白取消
     * @param {Function} callBack -回调函数 (只在开启定时消失时才生效)
     * @param {String} type -动画类型 (加载,成功,失败,提示)
     * @example
     * new TipBox();
     * new TipBox({type:'load',setTime:1000,callBack:function(){ alert(..) }});
     */

    var tipBox = function () {
        var config = {
            width          : 180,
            height         : 150,
            str            : '正在处理',
            windowDom      : window,
            setTime        : 0,
            hasMask        : false,
            hasMaskWhite   : false,
            clickDomCancel : true,
            callBack       : null,
            type           : 'success'
        };

        var _mask = null;
        var boundingBox = null;

        var renderUI = function( tipType ) {
            boundingBox = $("<div id='animationTipBox'></div>");
            tipType == 'load' && loadRenderUI();
            tipType == 'tip'  && tipRenderUI();
            boundingBox.appendTo(config.windowDom.document.body);

            //是否显示遮罩
            if(config.hasMask){
                config.hasMaskWhite ? _mask = $("<div class='mask_white'></div>") : _mask = $("<div class='mask'></div>");
                _mask.appendTo(config.windowDom.document.body);
            }

            //定时消失
            _this = this;
            !config.setTime && typeof config.callBack === "function" && (config.setTime = 1);
            config.setTime && setTimeout( function(){ close(); }, config.setTime );
        };

        var bindUI = function(){
            _this = this;

            //点击空白立即取消
            config.clickDomCancel && boundingBox && boundingBox.click( function(){ close(); } );
        };

        var syncUI = function() {
            boundingBox.css({
                width       : config.width+'px',
                height      : config.height+'px',
                marginLeft  : "-"+(config.width/2)+'px',
                marginTop   : "-"+(config.height/2)+'px'
            });
        };

        //关闭
        var close = function() {
            destroy();
            config.setTime && typeof config.callBack === "function" && config.callBack();
        };

        //销毁
        var destroy = function() {
            _mask && _mask.remove();
            boundingBox && boundingBox.remove();
            boundingBox = null;
        };

        //提示效果UI
        var tipRenderUI = function(){
            var tip = "<div class='tip'>";
            tip +="		<div class='icon'>i</div>";
            tip +="		<div class='dec_txt'>"+config.str+"</div>";
            tip += "</div>";
            boundingBox.append(tip);
        };

        //加载动画load UI
        var loadRenderUI = function(){
            var load = "<div class='load'>";
            load += "<div class='icon_box'>";
            for(var i = 1; i < 4; i++ ){
                load += "<div class='cirBox"+i+"'>";
                load += 	"<div class='cir1'></div>";
                load += 	"<div class='cir2'></div>";
                load += 	"<div class='cir3'></div>";
                load += 	"<div class='cir4'></div>";
                load += "</div>";
            }
            load += "</div>";
            load += "</div>";
            load += "<div class='dec_txt'>"+config.str+"</div>";
            boundingBox.append(load);
        };

        var init = function( cfg ) {
            $.extend( config, cfg );
        };

        var render = function(el) {
            var tipType = config.type;

            renderUI(tipType);

            //绑定事件
            bindUI();

            //初始化UI
            syncUI();
            $( el || config.windowDom.document.body ).append( boundingBox );
        };

        return {
            show: function( cfg, el ) {
                init(cfg);
                render(el);
            },
            close: function() {
                close();
            }
        };
    };

    return tipBox();
});
