/**
 * @fileoverview 1.防止同一个ajax同时发送多次 2自动处理跨域请求 3.用ajaxform处理post的跨域请求
 * @author houyulei
 * @example Ajax.get('url','data=1',function(){});用法同jQuery的AJAX api一致
 */
define('ajax', function (require, exports, module) {
    var Uri = require('uri');
    // var secret = require('modules/yinyuetai/secret');

    var _requestList = [];
    var equal = function (obj1, obj2) {
        if (typeof (obj1) === 'string' && typeof (obj2) === 'string') {
            return obj1 === obj2;
        } else if (typeof (obj1) === 'object' && typeof (obj2) === 'object') {
            return $.param(obj1) === $.param(obj2);
        }
        return false;
    };

    var isCrossDomain = function (url) {
        var uri = new Uri(url);
        var host = uri.host();
        return uri.protocol() !== '' && host !== '' && host !== document.domain;
    };

    var createPostForm = function (settings) {
        var $form = $('<form method="post"></form>').attr({
            'action': settings.url
        }).appendTo(document.body);
        var data = settings.data || '', datas, dataJSON = {};

        if (typeof data === 'string') {
            datas = data.split('&');
            $.each(datas, function (index, item) {
                item = item.split('=');
                dataJSON[item[0]] = item[1];
            })
        } else {
            dataJSON = data;
        }
        $.each(dataJSON, function (key, value) {
            $('<input type="hidden"/>').attr({
                name: key,
                value: value
            }).appendTo($form);
        });

        return $form;
    };

    var crossDomainPost = function (settings) {
        var AjaxForm = require("ajaxform");

        var $form = createPostForm(settings);

        new AjaxForm($form, {
            // secretParam : settings.secretParam || function() {
            // return [];
            // },
            onComplete: function (result) {
                $($form.attr('target')).remove();
                $form.remove();
                if (settings.success) {
                    settings.success(result);
                }
                if (_.isFunction(settings.complete)) {
                    settings.complete(result);
                } else if (_.isArray(settings.complete)) {
                    _.each(settings.complete, function (fun) {
                        fun(result);
                    })
                }
            }
        });
        $form.submit();
    };

    var beforeSend = function (settings) {
        for (var i = 0, len = _requestList.length; i < len; i++) {
            var _request = _requestList[i];
            if (settings.url == _request.url
                && equal(_request.data, settings.data)) {
                return false;
            }
        }
        _requestList.push(settings);

        var _type = settings.type.toLowerCase();
        if (isCrossDomain(settings.url)) {
            if (_type === 'post') {
                crossDomainPost(settings);
                return false;
            } else {
                settings.dataType = "jsonp";
            }
        } else if (_type === 'post') {
//            var json = encrypt(settings.secretName, settings.secretParam);
//            if (json) {
//                if (settings.data) {
//                    if (typeof settings.data === 'string') {
//                        settings.data += '&' + $.param(json);
//                    } else {
//                        settings.data = $.extend(settings.data, json);
//                    }
//                } else {
//                    settings.data = json;
//                }
//            }
        }
        return settings;
    };

    // var encrypt = function(secretName, secretParam) {
    // if (secret[secretName]) {
    // return secret[secretName](secretParam());
    // }
    // return null;
    // /*return require(['modules/yinyuetai/secret'], function(secret) {
    // if (secret[secretName]) {
    // return secret[secretName](secretParam());
    // }
    // return null;
    // });*/
    // };

    return {
        ajax: function (options) {
            var complete = [ function () {
                _requestList = _.without(_requestList, options);
            } ];
            var success = [function (data) {
                if (data.result == 2) {
                    //location.href = data.data;
                }
            }]
            if (options.complete) {
                complete = complete.concat(options.complete);
            }
            options.complete = undefined;

            if (options.success) {
                success = success.concat(options.success);
            }
            options.success = undefined;

            options = $.extend({
                timeout: 10000,
                jsonp: 'callback',
                type: 'get',
                // secretName : 'des',
                // secretParam : function() {
                // return [];
                // },
                complete: complete,
                success: success
            }, options);

            var checkResult = true;
            if (options.beforeSend && typeof options.beforeSend === "function") {
                checkResult = options.beforeSend();
            }
            if (checkResult === false) {
                return;
            }
            var settings = beforeSend(options);
            if (settings) {
                return $.ajax(settings);
            }
        },
        get: function (url, data, success, dataType) {
            var options = {
                type: 'GET'
            };
            url && (options.url = url);
            if (typeof data === "function") {
                options.success = data;
            } else if (data) {
                options.data = data;
            }
            if (typeof success === "function") {
                options.success = success;
            } else if (success) {
                options.dataType = success;
            }
            dataType && (options.dataType = dataType);
            return this.ajax(options);
        },
        getJSON: function (url, data, success) {
            return this.get(url, data, success, 'json');
        },
        post: function (url, data, success, dataType) {
            var options = {
                type: 'POST'
            };
            url && (options.url = url);
            if (typeof data === "function") {
                options.success = data;
            } else if (data) {
                options.data = data;
            }
            if (typeof success === "function") {
                options.success = success;
            } else if (success) {
                options.dataType = success;
            }
            dataType && (options.dataType = dataType);
            return this.ajax(options);
        }
    };
});

/**
 * @desc M版utils模块
 *
 * @created 2015.4.23
 * @update 2015.4.23
 */

define( 'util', function () {
    var util = {
        /**
         *1、 < 60s, 显示为“刚刚”
         *2、 >= 1min && < 60 min, 显示与当前时间差“XX分钟前”
         *3、 >= 60min && < 1day, 显示与当前时间差“今天 XX: XX”
         *4、 >= 1day && < 1year, 显示日 期“XX月 XX日 XX: XX”
         *5、 >= 1year, 显示具体日 期“XXXX年XX月 XX日 XX: XX”
         */
        timeFormat: function (time) {
            var date = new Date(time),
                curDate = new Date() ,
                year = date.getFullYear() ,
                month = date.getMonth() + 1,
                day = date.getDate() ,
                hour = date.getHours() ,
                minute = date.getMinutes() ,
                curYear = curDate.getFullYear() ,
                curHour = curDate.getHours() ,
                timeStr;

            minute = minute > 10 ? minute : '0' + minute;
            if (year < curYear) {
                timeStr = year + '年' + month + '月' + day + '日 ' + hour + ':' + minute;
            } else {
                var pastTime = curDate - date,
                    pastH = pastTime / 3600000;

                if (pastH > curHour) {
                    timeStr = month + '月' + day + '日 ' + hour + ':' + minute;
                } else if (pastH >= 1) {
                    timeStr = '今天 ' + hour + ':' + minute;
                } else {
                    var pastM = curDate.getMinutes() - minute;
                    if (pastM > 1) {
                        timeStr = pastM + ' 分钟前';
                    } else {
                        timeStr = ' 刚刚';
                    }
                }
            }

            return timeStr;
        },

        /**
         * 图片预加载
         * @param src
         */
        loadImg: function (src, dataId) {
            if (!src) {
                return;
            }
            // height / width = 075
            var standardRatio = 0.75;
            var fixWidth = 280;
            var fixHeight = 210;
            var preloadImg = new Image();
            var selector = '.feed_pic_list li img[data-id="' + dataId + '"]';

            preloadImg.onload = function () {
                preloadImg.onload = null;

                var width = preloadImg.width;
                var height = preloadImg.height;
                var origiRatio = parseFloat((height / width).toFixed(3)) * 1000;
                var minRatio = (standardRatio - 0.2) * 1000;
                var maxRatio = (standardRatio + 0.2) * 1000;
                var ratio = standardRatio * 1000;

                //console.log(selector + ' 宽高比 ' + origiRatio);
                // 特别小的图标
                if (width < 150 && height < 150) {
                    $(selector).attr('width', width).attr('height', height);
                } else if (minRatio < origiRatio && origiRatio < ratio || origiRatio > 1100) {
                    // 宽高比相似 或者 高很大
                    $(selector).attr('height', fixHeight);
                } else if (ratio < origiRatio && origiRatio < maxRatio || origiRatio < 400) {
                    // 宽高比相似 或者 宽大很多
                    $(selector).attr('width', fixWidth);
                } else {
                    // 宽大很多 // 高大很多
                    //var reHeight = height / width * fixWidth;
                    $(selector).attr('width', fixWidth);
                }
            };

            preloadImg.src = src;
        }
    }

    return util;

});

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

/**
 * @desc M版后台请求URL配置
 *
 * @created 2015.4.21
 * @update 2015.4.21
 */

define( 'config', function ($config) {
    return _.extend({
        /**
         * M版首页URL配置
         */

        INDEX: {
             // 电影列表
            GET_MOVIES: "https://api.douban.com/v2/movie/search", 
            GET_MOVIEINFO: "https://api.douban.com/v2/movie/subject/", 
            GET_REVIEWS: "https://api.douban.com/v2/movie/subject/:id/reviews", 
            GET_PHOTOS: "https://api.douban.com/v2/movie/subject/:id/photos",

            // 图书 https://api.douban.com/v2/book/search?tag=%E7%A7%91%E6%8A%80
            GET_BOOKS: "https://api.douban.com/v2/book/search", 
            GET_BOOKINFO: "https://api.douban.com/v2/book/", 

            // 活动

        }
    }, $config);
});
/**
 * @desc M版模板库
 *
 * @created 2015.4.21
 * @update 2015.4.27
 */

define( 'template', ['config'], function ($config) {
    return {

        INDEX_HEAD_TPL: [
            '<div class="top_user_info">',
            '<a href="#index/space/{{data.userId}}">',
                '<img src="{{data.userId}}.jpg" />',
            '<span class="user_name">{{data.userName}}</span>',
            '</a></div>',
            '<a href="javascript:;" class="publish_btn"><span class="icon-edit"></span></a>'
        ].join(),





        /*------------------------------*\
            电影
        \*------------------------------*/


        // 首页列表
        INDEX_MOVIE_TPL: [
            '{@each list as item}',

            '<div class="feed_box">',

            '{# 基本信息}',
            '<header class="feed_header clearfix">',

            '{@if item.rating }',
            '<span class="fr star"><span class="star50"></span>{{item.rating.average}}</span>',
            '{@/if}',

            '<dl class="user_info">',
            '<dd class="user_related">',
            '<a href="#{{viewName}}/{{item.id}}" class="user_name cont_title ">{{item.title}}</a>',
    
            '{# 类型}',
            '<p class="meta color8">',
            '{@each item.genres as genre}',
            '<span class="">{{genre}}</span>',
            '{@/each}',
            '</p>',

            '{# 导演 主演}',
            '<p class="meta color8">',
            '{@each item.actors as actor}',
            '<a href="javascript:;" class="">{{actor}}</a>',
            '{@/each}',
            '</p>',

            '</dd></dl></header>',

            '<a href="#{{viewName}}/{{item.id}}">',

            '{# 内容}',
            '<section class="feed_cont">',
            '{# 图片列表}',
            '<div class="feed_pic"><ul class="feed_pic_list" data-imgs="{{item.imgs}}">',
            '{@each item.imgs as img, index}',
            '{@if index < 4 }',
            '<li><span class="pic_wrap">',
            '<img src="{{img}}"/>',
            '<i class="valign"></i></span></li>',
            '{@/if}',
            '{@/each}',
            '</ul></div>',

            '</section>',
            '</a>',

            '{# 赞、评论}',
            '<footer class="gray_bar flex_equal">',
            '<a href="javascript:;" class="flex_item"><i class="iconfont icon-heart"></i><span class="color8 text_sub">{{item.collect_count}}</span></a>',
            '<span class="line_gradient"></span>',
            '<a href="javascript:;" class="flex_item"><i class="iconfont icon-star"></i><span class="color8 text_sub">{{item.rating.stars}}</span></a>',
            '</footer>',

            '</div>',

            '{@/each}'
        ].join(''),
    
        /**
         * 详情页: 电影
         * TODO: 1、内容 剧情 剧照  2、演员  3、电评
         * update: 2015.05.4
         */
        INFO_MOVIE_TPL: [
            '<nav class="top_navgination clearfix">',
            '<a href="javascript:;" class="fl back J_movie_back"><i class="arror_left"></i></a>',
            '<h1 class="top_title txt_cut">电影介绍</h1>',
            '</nav>',

            '{# 具体内容}',
            '<div class="artical_cont mb60">',

            '{# 标题区}',
            '<header class="info_title information_title clearfix">',
            '<h2><a href="{{data.mobile_url}}">{{data.title}}</a></h2>',
            '<span class="fr star"><span class="star50"></span>{{data.rating.average}}</span>',
            '</header>',

            '{# 剧情}',
            '<article class="info_detail">{{{data.summary}}}',

            '{# 剧照}',
            '{@if data.images }',
            '<ul class="talk_imgs">',
            '<li><img src="{{data.images["large"]}}" /></li>',
            '{@each data.imgs as img}',
            '<li><img src="{{img}}" /></li>',
            '{@/each}',
            '</ul>',
            '{@/if}',

            '</article>',


            '{# 数据统计 }',
            '<section class="gray_bar cont_footer clearfix">',
            '<div class="fl count_num">评论 {{data.comments_count}}</div>',
            '<div class="fr flex_equal bar_opt">',
            '<a href="#" class="flex_item"><i class="iconfont icon-heart"></i><span class="color8">{{data.reviews_count}}</span></a>',
            '<span class="line_gradient"></span>',
            '<a href="#" class="flex_item"><i class="iconfont icon-reproduce"></i><span class="color8">{{data.wish_count}}</span></a>',
            '<span class="line_gradient"></span>',
            '<a href="#" class="flex_item"><i class="iconfont icon-star"></i><span class="color8">{{data.ratings_count}}</span></a>',
            '</div>',
            '</section>',


             '{# 导演 演员 展示区}',
            '<section class="message_wrap J_actors"></section>',

            '{# 评论列表区}',
            '<section class="comment_list J_movie_comments">',
            '</section>',

            // '<a href="javascript:;" class="showMore J_movie_commons_more">获取更多评论</a>',

            '</div>'

        ].join(''),

         // 
        MOVIE_ACTOR_TPL: [
            '{@each list as data}',

            '<div class="avatar_box msg_item clearfix">',
            '<div class="fl avatar">',
            '<div class="color_block blue_bg pink_bg">',
            '{@if data.avatars["small"] }',
            '<a href="{{data.alt}}"><img src="{{data.avatars["small"]}}"/></a>',
            '{@/if}',
            '</div>',
            '</div>',
            '<div class="content">',
            '<div class="msg_info clearfix">{{data.role}}<span class="fr gray_txt"></span></div>',
            '<div class="msg_type title_txt">{{data.name}}</div>',
            '</div>',
            '</div>',
            '{@/each}'
        ].join(''),

        // 详情评论
        INFO_COMMENTS_TPL: [
            '{@each list as it}',

            '<div class="comment_item">',
            '<header class="avatar_box clearfix">',
            '<div class="fl avatar">',
            '<a href="#">',
                '<img src="{{it.comment.userId}}.jpg" onerror="javascript:this.src=\'/images/app/honeybee/demoimg/default1.gif\'"/>',
            '</a>',
            '</div>',
            '<div class="content">',
            '<div class="related_info">',
            '<a href="#" class="fr gray_txt">回复</a>',
            '<span class="title_txt">{{it.comment.userName}}</span>',
            '</div>',
            '<span class="gray_txt">{{it.comment.createDate}}</span>',
            '</div>',
            '</header>',
            '<article class="coment_cont">{{it.comment.content}}</article>',
            '</div>',

            '{@/each}'
        ].join(''),

        // 图片详情
        INFO_PICS_TPL: [
            '<nav class="top_navgination info_pics_header clearfix">',
            '<a href="javascript:;" class="fl back J_info_back"><i class="arror_left"></i></a>',
            '<a href="javascript:;" class="fr publish J_pic_comments">{{data.commentCount}}条评论</a>',
            '<h1 class="top_title txt_cut J_pics_title">图片浏览</h1>',
            '</nav>',

            '{# 图片浏览区 }',
            '<section class="info_pics J_pics_wrapper"></section>',

            '<footer class="info_pics_footer">',
            '<div class="info_pics_summary J_pic_summary"></div>',
            '{# 统计数据 }',
            '<div class="gray_bar info_pics_stistic flex_equal J_pic_footer">',
            '<a href="javascript:;" class="flex_item"><i class="iconfont icon-heart"></i><span class="color8">{{data.diggCount}}</span></a>',
            '<span class="line_gradient"></span>',
            '<a href="javascript:;" class="flex_item"><i class="iconfont icon-reproduce"></i><span class="color8">{{data.transferCount}}</span></a>',
            '<span class="line_gradient"></span>',
            '<a href="javascript:;" class="flex_item"><i class="iconfont icon-star"></i><span class="color8">{{data.collectCount}}</span></a>',
            '</div></footer>'

        ].join(''),

        INFO_PICS_FOOTER_TPL: [
            '{# 统计数据 }',
            '<a href="javascript:;" class="flex_item"><i class="iconfont icon-heart"></i><span class="color8">{{data.diggCount}}</span></a>',
            '<span class="line_gradient"></span>',
            '<a href="javascript:;" class="flex_item"><i class="iconfont icon-reproduce"></i><span class="color8">{{data.transferCount}}</span></a>',
            '<span class="line_gradient"></span>',
            '<a href="javascript:;" class="flex_item"><i class="iconfont icon-star"></i><span class="color8">{{data.collectCount}}</span></a>'
        ].join(''),





        /*------------------------------*\
            图书
        \*------------------------------*/


        // 图书列表
        BOOKS_TPL: [
            '<li class="book_box">',
            '<a href="#books/{{data.id}}">',

            '<span class="pic_wrap">',
            '<img src="{{data.images["large"]}}"/>',
            '<i class="valign"></i></span>',
            '<p class="title">{{data.title}}</p>',
            '</a>',

            '</li>'
        ].join(''),


         /**
         * 详情页: 图书
         * TODO: 1、内容 剧情 剧照  2、演员  3、电评
         * update: 2015.05.4
         */
        INFO_BOOK_TPL: [
            '<nav class="top_navgination clearfix">',
            '<a href="javascript:;" class="fl back J_book_back"><i class="arror_left"></i></a>',
            '<h1 class="top_title txt_cut">图书介绍</h1>',
            '</nav>',

            '{# 具体内容}',
            '<div class="artical_cont mb60">',

            '{# 标题区}',
            '<header class="info_title information_title clearfix">',
            '<h2><a href="{{data.alt}}">{{data.title}}</a></h2>',
            '<span class="fr star"><span class="star50"></span>{{data.rating.average}}</span>',
            '</header>',

            '{# 剧情}',
            '<article class="info_detail">{{{data.summary}}}',

            '{# 剧照}',
            '{@if data.images }',
            '<ul class="talk_imgs">',
            '<li><img src="{{data.images["large"]}}" /></li>',
            '</ul>',
            '{@/if}',

            '</article>',

            '{# 目录结构 }',
            '<article class="info_detail">{{data.catalog}}</article>',

            '{# 作者}',
            '<article class="info_detail">{{data.author_intro}}</article>',

            '</div>'

        ].join('')
    
    
    }
});

/**
 * @desc M版路由模块
 *
 * @created 2015.4.21
 * @update 2015.4.21
 */

define( 'router', [ 'index', 'movieInfo', 'bookInfo' ],
    function ( app, MovieInfo, BookInfo ) {

        /**
         * TODO: 路由
         */

        var AppRouter = Backbone.Router.extend({
            options: {
                movieInfo: null,
                bookInfo: null,
                index: $('.J_index'),
                info: $('.J_info')
            },

            initialize: function () {
                
            },

            routes: {
                // '': "index",
                'movies/:id': 'showMovieInfo',
                'space/:type/:feedId': 'showSpaceFeed',
                'books/:id': 'showBookInfo'
            },

            switchPage: function (inPage, outPage) {
                outPage.addClass('old_page out');
                inPage.addClass('show in');

                setTimeout(function () {
                        outPage.removeClass('old_page out').hide();
                        inPage.removeClass('show in').addClass('current');

                        inPage.get(0).scrollIntoView();
                    },
                    400
                );
            },

            showMovieInfo: function ( id ) {
                var _this = this;

                if ( id ) {
                    if(!this.options.movieInfo) this.options.movieInfo = new MovieInfo;

                    var infoView = this.options.movieInfo ;
                    var callback = function () {
                        var index = _this.options.index;
                        var info = _this.options.info;
                        _this.switchPage(info, index);
                    };

                    infoView.getMovie( id, callback );
                }
            },

            showBookInfo: function ( id ) {
                var _this = this;

                if ( id ) {
                    if(!this.options.bookInfo) this.options.bookInfo = new BookInfo;

                    var infoView = this.options.bookInfo ;
                    var callback = function () {
                        var index = _this.options.index;
                        var info = _this.options.info;
                        _this.switchPage(info, index);
                    };

                    infoView.getBook( id, callback );
                }
            }

        });

        return AppRouter;

    });
/**
 * @desc M版图片 utils操作封装模块
 *
 * @created 2015.5.13
 * @update 2015.5.13
 */

define( 'picUtil', [ 'config', 'juicer', 'template', 'ajax', 'util'], function ($config, juicer, tpl, Ajax, util) {

    var picUtil = {
        // 个人:1  容器: 2  应用:3
        picType: 2,
        containerId: '',
        containerType: '',

        /**
         * 获取图片 个人 容器 应用
         * @param feedId
         * @param callback
         */
        getPic: function( feedId, callback ) {
            var _this = this;
            // 通过feedId知道什么类型
            var picInfo = feedId.split( '-' );
            var picType = _this.picType = picInfo[0];
            var phtotoId = picInfo[ picInfo.length - 1 ];
            var info ={};

            var cb = function( info ) {
                // render
                $( '.J_info' ).html( juicer( tpl.INFO_PICS_TPL, {data: info} ) );

                var picTypeId = info.picTypeId;
                _this.getPicGroup( picTypeId, 1, phtotoId );

                if(callback) callback( info );
            };

            if( picType ) {
                switch (picType) {
                    case '1':
                    case '3':
                        Ajax.get($config.INDEX.GET_INFO_PIC, { 'photoId': phtotoId },
                            function( json ) {
                                if( json.result === 1 ) {
                                    var data = json.data;
                                    var baseData = data.sphoto;
                                    var statistics = data.semantideStatistics;
                                    var info = {
                                        picTypeId: baseData.selfTypeId,
                                        summary: baseData.summary || '',
                                        photoUrl: baseData.photoUrl,
                                        photoId: baseData.photoId,
                                        collectCount: statistics.collectCount > 0 ? statistics.collectCount : '收藏',
                                        commentCount: statistics.commentCount > 0 ? statistics.commentCount : '0',
                                        diggCount: statistics.diggCount > 0 ? statistics.diggCount : '赞',
                                        transferCount: statistics.transferCount > 0 ? statistics.transferCount : '转发'
                                    };

                                    cb( info );
                                }
                            });
                        break;

                    case '2':
                        var containerId  = _this.containerId = picInfo[1];
                        var containerType  = _this.containerType = picInfo[2];
                        var containerPhotoId = _this.containerPhotoId = picInfo[3];
                        Ajax.get($config.INDEX.GET_INFO_CONPIC,  //containerPhotoId=86&containerType=class&containerId=100114
                            { 'containerPhotoId': containerPhotoId, 'containerType': containerType, 'containerId': containerId },
                            function( json ) {
                                if( json.result === 1 ) {
                                    var data = json.data;
                                    var baseData = data.sContainerPhoto;
                                    var statistics = data.sSemantideStatistics;
                                    var info = {
                                        picTypeId: baseData.containerContentCategoryId,
                                        summary: baseData.photoSummary || '',
                                        photoUrl: baseData.photoUrl,
                                        photoId: baseData.photoId,
                                        collectCount: statistics.collectCount > 0 ? statistics.collectCount : '收藏',
                                        commentCount: statistics.commentCount > 0 ? statistics.commentCount : '0',
                                        diggCount: statistics.diggCount > 0 ? statistics.diggCount : '赞',
                                        transferCount: statistics.transferCount > 0 ? statistics.transferCount : '转发'
                                    };

                                    cb( info );
                                }
                            });
                        break;
                }
            }

        },

        getPics: function ( picTypeId, pageNo, callback, photoId ) {
            var _this = this;
            var pageSize = 10;
            var picType = _this.picType;
            var containerType = _this.containerType;

            var cb = function( data, totalCount ) {
                var list = data;
                var index = 0;
                var find = pageNo == 1 ? false : true;

                // photoUrl summary userId
                var data =  _.map(list, function( item ) {
                    var phId = item.containerPhotoId || item.photoId;
                    if(!find) {
                        index++;
                        if( photoId == phId) find = true;
                    }

                    var userId = item.originalUserId &&
                    item.originalUserId !== '0' ? item.originalUserId : item.userId || item.userId;

                    return {
                        photoId: item.photoId,
                        cPhotoId: phId,
                        summary: item.photoSummary,
                        content: "/uploads/honeybee/data/upload/photo/" + userId +'/'+ item.photoUrl
                    };
                });

                if( typeof callback === 'function' ) callback( data, totalCount, index );
            };

            if( picType ) {
                switch (picType) {
                    case '3':
                    case '1':
                        Ajax.get($config.INDEX.GET_INFO_PICGROUP,
                            { 'selfTypeId': picTypeId, 'pageNo': pageNo, 'pageSize': pageSize },
                            function( json ) {
                                if( json.result === 1 ) {
                                    var totalCount = json.data.totalCount;
                                    var data = json.data.data;

                                    if( typeof cb === 'function' ) cb( data, totalCount);
                                }
                            });
                        break;

                    case '2':
                        var containerId = _this.containerId;
                        var containerType = _this.containerType;
                        Ajax.get($config.INDEX.GET_INFO_CONPICGROUP,  //containerId=100114&containerType=class&containerContentCategoryId=400468
                            { 'containerId': containerId, 'containerType': containerType, 'containerContentCategoryId': picTypeId , 'pageNo': pageNo, 'pageSize': pageSize },
                            function( json ) {
                                if( json.result === 1 ) {
                                    var totalCount = json.data.totalCount;
                                    var data = json.data.data;

                                    if( typeof cb === 'function' ) cb( data, totalCount);
                                }
                            });
                        break;
                }

            }

        },

        getPicGroup: function( picTypeId, pageNo, photoId ) {
            var _this = this;
            var pageSize = 10;
            var callback = function( data, totalCount, index ) {
                $('.J_pics_title').html( index + ' / ' + totalCount );

                var islider = new iSlider({
                    type: 'pic',
                    data: data,
                    dom: $( '.J_pics_wrapper' ).get(0),
                    animateType: 'default',
                    initIndex: index - 1,  //默认显示第一个
                    totalCount: totalCount,
                    selfTypeId: picTypeId,
                    onslideend: _this.swipePicFn
                });
            }

            _this.getPics( picTypeId, 1, callback, photoId );
        },

        getPicInfo: function( photoId, containerPhotoId,  containerType ) {
            var _this = this;
            Ajax.get($config.INDEX.GET_INFO_PIC_STATISTICS,
                { 'photoId': photoId, 'containerPhotoId': containerPhotoId, 'containerType': containerType },
                function( json ) {
                    if( json.result === 1 ) {
                        var data = json.data;
                        var info = {};
                        var statistics = data.semantideStatistics;
                        info.collectCount = statistics.collectCount > 0 ? statistics.collectCount : '收藏';
                        info.commentCount = statistics.commentCount > 0 ? statistics.commentCount : '0';
                        info.diggCount = statistics.diggCount > 0 ? statistics.diggCount : '赞';
                        info.transferCount = statistics.transferCount > 0 ? statistics.transferCount : '转发';

                        // render
                        $( '.J_pic_footer' ).html( juicer( tpl.INFO_PICS_FOOTER_TPL, {data: info} ) );
                        $( '.J_pic_comments' ).html( info.commentCount + '条评论' );
                    }
                });
        },

        /**
         * 图片滑动调用事件
         */
        swipePicFn: function() {
            var _this = this;
            var pageSize = 10;
            var index = _this.slideIndex + 1;
            var totalCount = _this._opts && _this._opts.totalCount || _this.data.length;
            var length = _this.data.length;

            if( (length-2) === index && index % pageSize === 8 ) {
                var pageNo = Math.floor(index / pageSize) + 2;
                var selfTypeId = _this._opts.selfTypeId;
                var callback = function (data) {
                    $tipbox.close();
                    $.each(data, function ( index, item ) {
                        _this.data.push( item );
                    });
                    $('.J_pics_title').html( index + ' / ' + totalCount );
                };

                $tipbox.show( {type:'load', str:"努力加载中.."} );
                var me = $Index.config.infoView.config.picUtil;
                me.getPics( selfTypeId, pageNo, callback );
            } else {
                $('.J_pics_title').html( index + ' / ' + totalCount );
            }

            // 图片详细信息
            var item = _this.data[_this.slideIndex];
            var me = $Index.config.infoView.config.picUtil;
            var containerType = me.containerType;
            $('.J_pic_summary').html( item.summary || '' );
            if( item.photoId ) me.getPicInfo( item.photoId , item.cPhotoId, containerType);
        }

    };

    return picUtil;

});

/**
 * @desc 电影详情
 *
 * @created 2015.6.28
 * @update 2015.6.28
 */

define( 'movieInfo', [ 'config', 'juicer', 'template', 'ajax', 'util', 'picUtil' ],
    function ( $config, juicer, tpl, Ajax, util, picUtil ) {

        /**
         *  @module 详情
         *  @desc feed详情
         */
        var MovieInfo = Backbone.View.extend({
            el: $(".J_info"),

            events: {
                'click .J_movie_commons_more': '',
                'click .J_movie_back': 'backTo'
            },

            options: {
                pageNo: 1,
                pageSzie: 10,
                // 详情类型 文章 资源 视频 图片 说说
                infoType: '',
                feedId: '',
                picUtil: picUtil,
                //indexFeed:首页feed  space: 空间feed
                prevEl: $(".J_index"),
                current: ''
            },

            initialize: function (options) {
                var _this = this;

                var infoContent = this.el;
                infoContent.addEventListener('touchstart', this, false);
            },

            /**
             * feed详情
             */
            getMovie: function ( id, callback ) {
                var _this = this;
                var pageSzie = _this.options.pageSzie || 10;

                this.options.id = id;
                var url = $config.INDEX.GET_MOVIEINFO + id;

                Ajax.get( url, function (json) {
                    var data = json;
                    // render
                    $('.J_info').html(juicer(tpl.INFO_MOVIE_TPL, {data: data}));

                    var actors = [];
                    _.each( data.directors, function ( director, index ) {
                            director.role = '导演';
                            director.name && actors.push( director );
                        });

                    _.each( data.casts, function ( cast, index ) {
                            cast.role = '演员';
                            cast.name && actors.push( cast);
                        });

                    $('.J_actors').html(juicer(tpl.MOVIE_ACTOR_TPL, {list: actors}));

                    if (typeof callback === 'function' ) callback({});
                                    
                    // 格式化数据
                    //obj.templateInfo = JSON.parse( obj.templateInfo );
                    // info.createDate = util.timeFormat(parseInt(baseData.createDate, 10));

                    // 存在评论 取出
                    // if ( data.comments_count ) _this.getComments( id, 0, pageSzie);
                    // if (statistics.commentCount < 10) $('.J_info_commons_more').hide();
                });

            },

            /**
             * feed评论列表
             * @param topicId
             * @param pageNo
             * @param callback
             */
            getComments: function (topicId, pageNo, pageSzie, callback) {
                var _this = this;
                pageNo = pageNo || this.options.pageNo;
                pageSize = pageSzie || this.options.pageSize;
                var start = pageNo * pageSize;
                var url = $config.INDEX.GET_REVIEWS.replace(':id', id);

                Ajax.get( url, {'start': start, 'count': pageSize }, 
                    function (json) {
                        if (json.result === 1) {
                            var data = json;

                            // 格式化数据
                            $.each(data, function (index, obj) {
                                // obj.comment.createDate = util.timeFormat(parseInt(obj.comment.createDate, 10));
                            });

                            $('.J_info_comments').html(juicer(tpl.INFO_COMMENTS_TPL, {list: data}));

                            if (callback) callback({});

                        }
                        ;
                    });
            },

            // TODO
            getMoreComments: function (e) {
                var _this = this;
                var type = _this.options.infoType;
                var feedId = _this.options.feedId;
                var pageNo = ++_this.options.pageNo;
                var pageSize = _this.options.pageSzie;

                _this.getInfoComments(feedId, type, pageNo, pageSize);
            },

            handleEvent: function(event) {
                var _this = this;

                //console.log(event.type);
                if (event.type == 'touchstart') {
                    _this.start(event);
                } else if(event.type == 'touchmove') {
                    _this.move(event);
                } else if(event.type == 'touchend') {
                    _this.end(event);
                }
            },

            // 滑动开始
            start: function( event ) {
                if ( !event.touches || event.touches.length < 1) return;
                // TODO 有浏览器 只触发一次 touchmove
                // /^(?:INPUT|SELECT|TEXTAREA|A)$/.test( event.target.tagName ) || event.preventDefault();
                // event.preventDefault();
                this.isMoving = true;
                this.sWidth = $(document.body).width();
                this.startTime = new Date().getTime();
                this.startX = event.touches[0].pageX || event.targetTouches[0].pageX;
                this.startY = event.touches[0].pageY || event.targetTouches[0].pageY;
                this.supportAnimations = vendor;

                // 绑定事件
                var infoContent = this.el;
                infoContent.addEventListener( 'touchmove', this, false );
                infoContent.addEventListener( 'touchend', this, false );
            },

            // 移动
            move: function( event ) {
                if ( !event.touches || event.touches.length < 1) return;
                if (this.isMoving && this.supportAnimations !== false ) {
                    var offset = {
                        X: event.targetTouches[0].pageX - this.startX,
                        Y: event.targetTouches[0].pageY - this.startY
                    };
                    // TODO: 向右滑动
                    if ( Math.abs(offset['X']) - Math.abs(offset['Y']) > 10 && offset['X'] > 0 ) {
                        event.preventDefault();
                        var sWidth = this.sWidth;
                        var info = this.el;
                        var prevEl = this.options.prevEl;
                        var prev = prevEl.get(0);
                        prevEl.show().addClass('prev show');
                        
                        var transitionName = css3TransNames.transition;
                        var transformName = css3TransNames.transform;
                        info.style[transitionName] = 'all 0s';
                        prev.style[transitionName] = 'all 0s';
                        info.style[transformName] = 'translateX(' + (offset['X']) + 'px)';
                        prev.style[transformName]  = 'translateX(' + (offset['X'] - sWidth + 10 ) + 'px)';
                    }

                    // 上下滑动方案 dom.style.webkitTransform = 'translate(' + x + 'px, ' + y + 'px)';
                    this.offset = offset;
                }
            },

            // 滑动释放
            end: function( event ) {
                if ( !event.touches ) return;
                var _this = this;
                this.isMoving = false;
                var offset = this.offset;
                var boundary = 50;
                //var endTime = new Date().getTime();

                // a quick slide time must under 300ms
                // a quick slide should also slide at least 14 px
                // boundary = endTime - this.startTime > 300 ? boundary : 14;
                var absOffset = Math.abs(offset['X']);
                var absReverseOffset = Math.abs(offset['Y']);

                var info = _this.el;
                var prevEl = _this.options.prevEl;
                var prev = prevEl.get(0);
                var transitionName = css3TransNames.transition;
                var transformName = css3TransNames.transform;

                // TODO 左右滑动
                if ( this.supportAnimations !== false  && offset['X'] >= boundary && absReverseOffset < absOffset ) {
        
                    info.style[transitionName] = 'all 0.2s';
                    prev.style[transitionName] = 'all 0.2s';
                    info.style[transformName] = 'translateX(100%)';
                    prev.style[transformName] = 'translateX(0)';

                    setTimeout( function() {
                            _this.$el.removeClass('current');
                            prevEl.show().removeClass('hide prev show');

                            info.style[transitionName] = '';
                            info.style[transformName] = '';
                            prev.style[transitionName] = '';
                            prev.style[transformName] = '';

                            $appRouter.navigate("", {trigger: false, replace: true});
                            // TODO: 暂停视频播放
                            $('video').trigger('pause');
                            // 清理详情结构
                            _this.$el.html('');

                        },
                        200
                    );

                } else {
                    prevEl.removeClass('prev show').hide();
                    info.style[transitionName] = '';
                    info.style[transformName] = '';
                    prev.style[transitionName] = '';
                    prev.style[transformName] = '';
                }

                this.offset.X = this.offset.Y = 0;

                // 解绑事件
                var infoContent = info;
                infoContent.removeEventListener( 'touchmove', this, false );
                infoContent.removeEventListener( 'touchend', this, false );
            },

            // TODO
            backTo: function ( evt ) {
                evt.stopPropagation();
                evt.preventDefault();

                var _this = this;
                var current = _this.options.current;
                var currentRecordId = '';
                var info = $('.J_info') || _this.$el;
                var prev = $('.J_index') || _this.options.prevEl;

                $appRouter.navigate("", {trigger: false, replace: true});

                info.addClass('show out');
                    //index.addClass('old_page in').removeClass('hide');
                prev.show().addClass('old_page in');

                    /*
                     info.addClass('show out').on( 'webkitTransitionEnd', function() {
                     info.off( 'webkitTransitionEnd' );
                     info.removeClass('current show out');
                     } );

                     index.removeClass('hide').addClass('old_page in').on( 'webkitTransitionEnd', function() {
                     index.off( 'webkitTransitionEnd' );
                     index.removeClass('old_page in');
                     } );
                     */

                    //$appRouter.navigate("", {trigger: false, replace: true});
                    //if(currentRecordId) document.getElementById(currentRecordId).scrollIntoView();
                setTimeout(function () {
                            //info.removeClass('current show out');
                            //index.removeClass('old_page in').addClass('');
                            //if(currentRecordId) document.getElementById(currentRecordId).scrollIntoView();
                            // TODO: 暂停视频播放
                        // $('video').trigger('pause');
                            // 清理详情结构
                        info.html('');

                        info.removeClass('current show out');
                        prev.removeClass('old_page in').show();
                    },
                    600
                );

            }

        });

        return MovieInfo;

    });
/**
 * @desc movies
 *
 * @created 2015.6.22
 * @update 2015.6.22
 */

define( 'movies', ['config', 'juicer', 'template', 'ajax', 'util', 'movieInfo' ],
    function ($config, juicer, tpl, Ajax, util, info ) {

        var Movies = Backbone.View.extend({
            el: $(".J_movies_area"),

            options: {
                // 页数 每页十条
                pageNo: 0,
                pageSize: 10,
                // 
                tag: '经典',
                query: ''
            },

            events: {
                'click .J_movies_more': 'getMore'
            },

            initialize: function (options) {
                _.extend(this.options, options);

                var callback = function () {
                };

                this.getMovies(this.options.pageNo, callback);

                var movies = this.el;
                movies.addEventListener('touchstart', this, false);

            },

            /**
             *
             * @param pageNo
             */
            getMovies: function (pageNo, callback) {
                var _this = this;
                pageNo = pageNo || this.options.pageNo;
                var pageSize = this.options.pageSize || 10;
                var start = pageNo * pageSize;
                var q = this.options.query;
                var tag = this.options.tag || '经典';
                // https://api.douban.com/v2/movie/search?q=%E7%BB%8F%E5%85%B8
               
                Ajax.get($config.INDEX.GET_MOVIES, 
                    {'q': q, 'tag': tag, 'start': start, 'count': pageSize }, 
                    function (json) {
                    if ( json.count ) {
                        var data = json.subjects;

                        _this.formatData(data);

                        if (pageNo === 0) {
                            _this.render(data);
                            _this.options.pageNo = pageNo;
                        } else {
                            _this.append(data);
                        }

                        if (typeof callback === 'function') callback();

                    } else {
        
                    }
                });
            },

            /**
             * 格式化数据 json字符串 时间计算 自定义字段扩展
             */
            formatData: function (data) {
                var _this = this;
    
                _.each(data, function ( obj, index ) {
                    // 图片列表 人员列表：导演 主演
                    var imgs = [];
                    var actors = [];

                    // 剧照
                    obj.images && obj.images['large'] && imgs.push(obj.images['large']);
                    // 导演 
                    if( obj.directors && obj.directors.length > 0 ){
                         _.each( obj.directors, function ( director, index ) {
                            director.name && actors.push( director.name );
                            director.avatars && imgs.push( director.avatars[ 'large' ] );
                        });
                    }

                    if( obj.casts && obj.casts.length > 0 ) {
                        _.each( obj.casts, function ( cast, index ) {
                            cast.name && actors.push( cast.name );
                            cast.avatars && imgs.push( cast.avatars[ 'large' ]);
                        });
                    }

                    obj.actors = actors;
                    obj.imgs = imgs;
                    // feedUtil.formatData(obj);
                });
            },

        
            /**
             * feed列表渲染
             * @param data
             */
            render: function (data) {
                $('.J_movies').html(juicer(tpl.INDEX_MOVIE_TPL, {
                    list: data,
                    viewName: 'movies'
                }));
            },

            append: function (data) {
                $('.J_movies').append(juicer(tpl.INDEX_MOVIE_TPL, {
                    list: data,
                    viewName: 'movies'
                }));
            },

            /**
             * 进入电影详情页
            */
            itemTap: function ( id, cb ) {
            },

            getMore: function (e) {
                e.stopPropagation();
                e.preventDefault();

                var _this = this;
                var pageNo = ++_this.options.pageNo;
                var callback = function () {
                    _this.isLoading = false;
                    $tipbox.close();
                };

                if (typeof _this.isLoading === 'undefined') _this.isLoading = false;

                if (_this.isLoading === false) {
                    _this.isLoading = true;
                    $tipbox.show({type: 'load', str: "努力加载中.."});
                    _this.getMovies(pageNo, callback);
                }
            },

            handleEvent: function (event) {
                var _this = this;

                // console.log(event.type);
                if (event.type == 'touchstart') {
                    _this.start(event);
                } else if (event.type == 'touchmove') {
                    _this.move(event);
                } else if (event.type == 'touchend') {
                    _this.end(event);
                }
            },

            // 滑动开始
            start: function (event) {
                if (!event.touches || event.touches.length < 1) return;

                this.isMoving = true;
                this.startTime = new Date().getTime();
                this.startX = event.touches[0].pageX;
                this.startY = event.touches[0].pageY;

                // 绑定事件
                var movies = this.el;
                movies.addEventListener('touchmove', this, false);
                movies.addEventListener('touchend', this, false);
            },

            // 移动
            move: function (event) {
                if (!event.touches || event.touches.length < 1) return;
                if (this.isMoving) {
                    var offset = {
                        X: event.touches[0].pageX - this.startX,
                        Y: event.touches[0].pageY - this.startY
                    };

                    this.offset = offset;
                }
            },

            // 滑动释放
            end: function (event) {
                if (!event.touches) return;
                this.isMoving = false;
                var offset = this.offset;
                var boundary = 100;
                var endTime = new Date().getTime();

                // a quick slide time must under 300ms
                // a quick slide should also slide at least 14 px
                //var duration = endTime - this.startTime > 300;
                if (!offset) return this;
                var xOffset = offset && Math.abs(offset['X']) || 0;

                // TODO: 向下滑动 增加开关量 做限制
                if (!this.isLoading && offset['Y'] < 0 && Math.abs(offset['Y'] + xOffset) > 10) {
                    var wrapper = this.$el.get(0);
                    if (wrapper.scrollHeight - wrapper.clientHeight - wrapper.scrollTop < 350) {
                        this.getMore(event);
                    }
                } else {
                }

                this.offset.X = this.offset.Y = 0;

                // 解绑事件
                var movies = this.el;
                movies.removeEventListener('touchmove', this, false);
                movies.removeEventListener('touchend', this, false);
            }

        });

        return Movies;

    });

/**
 * @desc M版消息模块
 *
 * @created 2015.4.27
 * @update 2015.4.27
 */

define( 'onlines', ['config', 'juicer', 'template', 'ajax' ],
    function( $config, juicer, tpl, Ajax ) {

        /**
         * 消息列表
         */
        var Onlines = Backbone.View.extend({
            config:{
                //页数 每页十条
                pageNo: 1,
                //
                userId: '',

                // 总页数
                totalPageCount: 0,
                unreadMsgs: null,

                // 详情视图
                infoView: null
            },

            events:{
                'click .J_msgs_more': 'getMore'
            },

            initialize: function (options) {
                _.extend(this.options, options);

                this.config.pageNo = 1;

                // 消息未读数目
                this.getMsgsUnReadCount();
                this.getMsgs(this.config.pageNo);
            },


            getMsgsUnReadCount: function() {
                var _this = this;
                var unreadMsgs =_this.config.unreadMsgs = $Index.config.unreadMsgs;

                if(unreadMsgs){
                    var unread = unreadMsgs['sysMessageCount'];
                    var content = unread===0 ? '系统消息': unread+'条系统消息';
                    var sys = {'unread': unread, 'iconType': 'icon-setting', 'url': 'sys',
                        iconbg: 'green_bg', 'content': content };

                    unread = unreadMsgs['appMessageUnRead'];
                    content = unread===0 ? '应用消息': unread+'条应用消息';
                    var apply = {'unread': unread, 'iconType': 'icon-apps', 'url': 'apply',
                        iconbg: 'blue_bg', 'content': content};

                    unread = unreadMsgs['newCommentCount'];
                    content = unread===0 ? '评论': unread+'条评论消息';
                    var comment = {'unread': unread, 'iconType': 'icon-talk', 'url': 'comment',
                        iconbg: 'orange_bg', 'content': content};

                    unread = unreadMsgs['newFollowedCount'];
                    content = unread===0 ? '粉丝列表': unread+'个新粉丝关注';
                    var follow = {'unread': unread, 'iconType': 'icon-people', 'url': 'follow',
                        iconbg: 'pink_bg', 'content': content};

                    $('.J_msgs_comment').html(juicer(tpl.MESSAGES_TYPE_TPL, {data : comment}));
                    $('.J_msgs_follow').html(juicer(tpl.MESSAGES_TYPE_TPL, {data : follow}));
                    $('.J_msgs_sys').html(juicer(tpl.MESSAGES_TYPE_TPL, {data : sys}));
                    $('.J_msgs_apply').html(juicer(tpl.MESSAGES_TYPE_TPL, {data : apply}));

                    if( !_this.config.infoView ) _this.config.infoView = new Info({el: $(".J_info")});

                } else {
                }

            },

            /**
             * 重置未读消息数目
             */
            resetUnReadCount: function() {
                var _this = this;
                // reset unread msgs 系统未读消息
                Ajax.get($config.INDEX.GET_INDEX_MSGS_UNREAD, { }, function(json) {
                    if(json.result === 1) {
                        var data = $Index.config.unreadMsgs = json.data;
                        var unread = data['totalCount'];

                        unread === 0 ? $('.J_unreads').html('')
                            : $('.J_unreads').addClass('msg_number').html(unread);

                        // reset other
                        _this.getMsgsUnReadCount();
                    }
                });
            },

            /**
             *
             * @param pageNo
             */
            getMsgs: function(pageNo) {
                var _this = this;
                var pageSize = 10;

                if(_this.totalPageCount && _this.totalPageCount < pageNo) return _this;

                Ajax.get($config.INDEX.GET_INDEX_MSGS_LINKMEN, {'pageNo': pageNo, 'pageSize': pageSize}, function(json) {
                    if(json.result === 1) {
                        var data =json.data && json.data.pageInfo.data;
                        _this.totalPageCount = json.data.pageInfo.totalPageCount

                        _this.userId =json.data.userId;
                        _this.formatData(data);

                        _this.append(data);
                    }
                });
            },

            /**
             * 格式化数据 json字符串 时间计算 自定义字段扩展
             */
            formatData:function(data){
                var _this = this;
                var friendId = '', friendName = '';

                $.each(data, function(index, obj) {
                    if(obj.message) {
                        var message = obj.message;

                        if(_this.userId == message.senderId) {
                            friendId = message.reciverId;
                            friendName = message.reciverName;
                        } else {
                            friendId = message.senderId;
                            friendName = message.senderName;
                        }

                        obj.message.senderId = friendId;
                        obj.message.senderName = friendName;

                        obj.message.sendTime = util.timeFormat(parseInt(obj.message.sendTime ,10));
                    }
                });
            },

            render : function(data) {
                $('.J_msgs').html(juicer(tpl.MESSAGES_TPL, {
                    list : data
                }));
            },

            append: function(data) {
                $('.J_msgs').append(juicer(tpl.MESSAGES_TPL, {
                    list : data
                }));
            },

            getMore: function(e) {
                var me = $Index.config.msgsView;
                var pageNo = ++me.config.pageNo;
                me.getMsgs(pageNo);
            },

            /**
             * 评论 粉丝 系统, 私信对话消息列表
             * @param type
             */
            getMsgList: function( type, friendId ) {
                var _this = this;
                var callback = function(data) {
                    // 重置未读消息
                    _this.resetUnReadCount();

                    $('.J_msgs_'+type).addClass('visited');
                };

                if(_this.config.infoView) {
                    _this.config.infoView.getMsgList(type, callback, friendId);
                }

            }

        });

        return Onlines;

    });
/**
 * @desc M版资讯模块
 *
 * @created 2015.6.22
 * @update 2015.6.22
 */

define( 'books', [ 'config', 'juicer', 'template', 'ajax' ],
    function( $config, juicer, tpl, Ajax ) {

    /**
     * 资讯列表
     */
    var Books = Backbone.View.extend({
        el: $(".J_books_area"),

        options:{
            // 页数 每页十条
            pageNo: 0,
            pageSize: 4,
            // 
            tag: '经典',
            query: ''
        },

        events:{
            'click .J_books_more': 'getMore'
        },

        initialize: function (options) {
            _.extend(this.options, options);

            var Books = this.el;
            Books.addEventListener( 'touchstart', this, false );
        },

        /**
         *
         * @param pageNo
         */
        getBooks: function( pageNo, callback ) {
            var _this = this;
            pageNo = pageNo || this.options.pageNo;
            var pageSize = this.options.pageSize || 10;
            var start = pageNo * pageSize;
            var q = this.options.query;
            var tag = this.options.tag || '经典';

            Ajax.get( $config.INDEX.GET_BOOKS, 
                {'q': q, 'tag': tag, 'start': start, 'count': pageSize }, 
                function( json ) {
                if( json ) {
                    var data = json.books;
                    // _this.formatData( data );
                    
                    _this.render( data );
                    _this.options.pageNo = pageNo;
                }

                if(typeof callback === 'function' ) callback();
            });
        },

        render : function(data) {
            var uls = $('.J_books ul');
            var sFragmentHtml = '';

            for(var i=0, len=data.length; i<len; i++){
                var item = data[i];
                sFragmentHtml = juicer(tpl.BOOKS_TPL, { data : item }); 
  
                uls.sort(function (ul1, ul2) {
                    return ul1.offsetHeight - ul2.offsetHeight;
                });

                uls.first().append(sFragmentHtml);
            } 

        },

        getMore: function( e ) {
            e.stopPropagation();
            e.preventDefault();

            var _this = this;
            var pageNo = ++_this.options.pageNo;
            var callback = function() {
                _this.isLoading = false;
                $tipbox.close();
            };

            if( typeof _this.isLoading === 'undefined' ) _this.isLoading = false;

            if( _this.isLoading === false) {
                _this.isLoading = true;
                $tipbox.show( {type:'load', str:"努力加载中.."});
                _this.getBooks( pageNo, callback );
            }
        },

        handleEvent: function(event) {
            var _this = this;

            if (event.type == 'touchstart') {
                _this.start(event);
            } else if(event.type == 'touchmove') {
                _this.move(event);
            } else if(event.type == 'touchend') {
                _this.end(event);
            }
        },

        // 滑动开始
        start: function( event ) {
            if ( !event.touches || event.touches.length < 1) return;

            this.isMoving = true;
            this.startTime = new Date().getTime();
            this.startX = event.touches[0].pageX;
            this.startY = event.touches[0].pageY;

            // 绑定事件
            var Books = this.el;
            Books.addEventListener( 'touchmove', this, false );
            Books.addEventListener( 'touchend', this, false );
        },

        // 移动
        move: function(event) {
            if ( !event.touches || event.touches.length < 1) return;
            if (this.isMoving) {
                var offset = {
                    X: event.touches[0].pageX - this.startX,
                    Y: event.touches[0].pageY - this.startY
                };

                this.offset = offset;
            }
        },

        // 滑动释放
        end: function( event ) {
            if ( !event.touches ) return;
            this.isMoving = false;
            var offset = this.offset;
            var endTime = new Date().getTime();

            // a quick slide time must under 300ms
            // a quick slide should also slide at least 14 px
            //var duration = endTime - this.startTime > 300;
            if( !offset ) return this;
            var xOffset = Math.abs(offset['X']) || 0;

            // TODO: 向下滑动 增加开关量 做限制
            if ( !this.isLoading && offset['Y'] < 0  && Math.abs( offset['Y'] + xOffset ) > 10  ) {
                var wrapper = this.el;
                if( wrapper.scrollHeight - wrapper.clientHeight - wrapper.scrollTop < 350 ) {
                    this.getMore( event );
                }
            } else {
            }

            this.offset.X = this.offset.Y = 0;

            // 解绑事件
            var Books = this.el;
            Books.removeEventListener('touchmove', this, false);
            Books.removeEventListener('touchend', this, false);
        }

    });

    return Books;

});
/**
 * @desc 电影详情
 *
 * @created 2015.6.28
 * @update 2015.6.28
 */

define( 'bookInfo', [ 'config', 'juicer', 'template', 'ajax' ],
    function ( $config, juicer, tpl, Ajax ) {

        /**
         *  @module 详情
         *  @desc feed详情
         */
        var BookInfo = Backbone.View.extend({
            el: $(".J_info"),

            events: {
                'click .J_book_back': 'backTo'
            },

            options: {
                pageNo: 1,
                pageSzie: 10,
                //indexFeed:首页feed  space: 空间feed
                prevEl: $(".J_index"),
                current: ''
            },

            initialize: function (options) {
                var _this = this;

                var infoContent = this.el;
                infoContent.addEventListener('touchstart', this, false);
            },

            /**
             * feed详情
             */
            getBook: function ( id, callback ) {
                var _this = this;
                var pageSzie = _this.options.pageSzie || 10;

                this.options.id = id;
                var url = $config.INDEX.GET_BOOKINFO + id;

                Ajax.get( url, function (json) {
                    var data = json;
                    // render
                    $('.J_info').html(juicer(tpl.INFO_BOOK_TPL, {data: data}));

                    var actors = [];
                    _.each( data.directors, function ( director, index ) {
                            director.role = '导演';
                            director.name && actors.push( director );
                        });

                    if (typeof callback === 'function' ) callback({});
                });

            },

            handleEvent: function(event) {
                var _this = this;

                //console.log(event.type);
                if (event.type == 'touchstart') {
                    _this.start(event);
                } else if(event.type == 'touchmove') {
                    _this.move(event);
                } else if(event.type == 'touchend') {
                    _this.end(event);
                }
            },

            // 滑动开始
            start: function( event ) {
                if ( !event.touches || event.touches.length < 1) return;
                // TODO 有浏览器 只触发一次 touchmove
                // /^(?:INPUT|SELECT|TEXTAREA|A)$/.test( event.target.tagName ) || event.preventDefault();
                // event.preventDefault();
                this.isMoving = true;
                this.sWidth = $(document.body).width();
                this.startTime = new Date().getTime();
                this.startX = event.touches[0].pageX || event.targetTouches[0].pageX;
                this.startY = event.touches[0].pageY || event.targetTouches[0].pageY;
                this.supportAnimations = vendor;

                // 绑定事件
                var infoContent = this.el;
                infoContent.addEventListener( 'touchmove', this, false );
                infoContent.addEventListener( 'touchend', this, false );
            },

            // 移动
            move: function( event ) {
                if ( !event.touches || event.touches.length < 1) return;
                if (this.isMoving && this.supportAnimations !== false ) {
                    var offset = {
                        X: event.targetTouches[0].pageX - this.startX,
                        Y: event.targetTouches[0].pageY - this.startY
                    };
                    // TODO: 向右滑动
                    if ( Math.abs(offset['X']) - Math.abs(offset['Y']) > 10 && offset['X'] > 0 ) {
                        event.preventDefault();
                        var sWidth = this.sWidth;
                        var info = this.el;
                        var prevEl = this.options.prevEl;
                        var prev = prevEl.get(0);
                        prevEl.show().addClass('prev show');
                        
                        var transitionName = css3TransNames.transition;
                        var transformName = css3TransNames.transform;
                        info.style[transitionName] = 'all 0s';
                        prev.style[transitionName] = 'all 0s';
                        info.style[transformName] = 'translateX(' + (offset['X']) + 'px)';
                        prev.style[transformName]  = 'translateX(' + (offset['X'] - sWidth + 10 ) + 'px)';
                    }

                    // 上下滑动方案 dom.style.webkitTransform = 'translate(' + x + 'px, ' + y + 'px)';
                    this.offset = offset;
                }
            },

            // 滑动释放
            end: function( event ) {
                if ( !event.touches ) return;
                var _this = this;
                this.isMoving = false;
                var offset = this.offset;
                var boundary = 50;
                //var endTime = new Date().getTime();

                // a quick slide time must under 300ms
                // a quick slide should also slide at least 14 px
                // boundary = endTime - this.startTime > 300 ? boundary : 14;
                var absOffset = Math.abs(offset['X']);
                var absReverseOffset = Math.abs(offset['Y']);

                var info = _this.el;
                var prevEl = _this.options.prevEl;
                var prev = prevEl.get(0);
                var transitionName = css3TransNames.transition;
                var transformName = css3TransNames.transform;

                // TODO 左右滑动
                if ( this.supportAnimations !== false  && offset['X'] >= boundary && absReverseOffset < absOffset ) {
        
                    info.style[transitionName] = 'all 0.2s';
                    prev.style[transitionName] = 'all 0.2s';
                    info.style[transformName] = 'translateX(100%)';
                    prev.style[transformName] = 'translateX(0)';

                    setTimeout( function() {
                            _this.$el.removeClass('current');
                            prevEl.show().removeClass('hide prev show');

                            info.style[transitionName] = '';
                            info.style[transformName] = '';
                            prev.style[transitionName] = '';
                            prev.style[transformName] = '';

                            $appRouter.navigate("", {trigger: false, replace: true});
                            // TODO: 暂停视频播放
                            $('video').trigger('pause');
                            // 清理详情结构
                            _this.$el.html('');

                        },
                        200
                    );

                } else {
                    prevEl.removeClass('prev show').hide();
                    info.style[transitionName] = '';
                    info.style[transformName] = '';
                    prev.style[transitionName] = '';
                    prev.style[transformName] = '';
                }

                this.offset.X = this.offset.Y = 0;

                // 解绑事件
                var infoContent = info;
                infoContent.removeEventListener( 'touchmove', this, false );
                infoContent.removeEventListener( 'touchend', this, false );
            },

            // TODO
            backTo: function ( evt ) {
                evt.stopPropagation();
                evt.preventDefault();

                var _this = this;
                var current = _this.options.current;
                var currentRecordId = '';
                var info = $('.J_info') || _this.$el;
                var prev = $('.J_index') || _this.options.prevEl;

                $appRouter.navigate("", {trigger: false, replace: true});

                info.addClass('show out');
                    //index.addClass('old_page in').removeClass('hide');
                prev.show().addClass('old_page in');

                    /*
                     info.addClass('show out').on( 'webkitTransitionEnd', function() {
                     info.off( 'webkitTransitionEnd' );
                     info.removeClass('current show out');
                     } );

                     index.removeClass('hide').addClass('old_page in').on( 'webkitTransitionEnd', function() {
                     index.off( 'webkitTransitionEnd' );
                     index.removeClass('old_page in');
                     } );
                     */

                    //$appRouter.navigate("", {trigger: false, replace: true});
                    //if(currentRecordId) document.getElementById(currentRecordId).scrollIntoView();
                setTimeout(function () {
                            //info.removeClass('current show out');
                            //index.removeClass('old_page in').addClass('');
                            //if(currentRecordId) document.getElementById(currentRecordId).scrollIntoView();
                            // TODO: 暂停视频播放
                        // $('video').trigger('pause');
                            // 清理详情结构
                        info.html('');

                        info.removeClass('current show out');
                        prev.removeClass('old_page in').show();
                    },
                    600
                );

            }

        });

        return BookInfo;

    });
/**
 * @desc M版首页模块
 *
 * @created 2015.4.21
 * @update 2015.4.21
 */

define( 'index', ['config', 'juicer', 'template', 'ajax','movies', 'books', 'onlines' ],
    function ($config, juicer, tpl, Ajax, Movies, Books, Onlines ) {

        /**
         * 首页请求
         */

        var Index = Backbone.View.extend({
            el : $(".J_index"),

            events: {
                'click .J_nav_books': 'getBooks',
                'click .J_nav_movies': 'getMovies',
                'click .J_nav_onlines': 'getOnlines'
            },

            options: {
                // 图书视图
                booksView: null,

                // 电影视图
                moviesView: null,

                // 活动视图
                onlinesView: null,

                //记录当前视图 moviesView 2: booksView 3: onlinesView
                current: 1,
                prev: 1

            },

            initialize: function (options) {
                _.extend(this.options, options);

                this.options.moviesView = new Movies;
            },
   
            /**
             * 资讯列表
             */
            getBooks: function ( evt ) {
                evt.stopPropagation();
                evt.preventDefault();

                var _this = this;

                if (!this.options.booksView) this.options.booksView = new Books;
                var booksView = _this.options.booksView;

                this.switchView(2);

                var callback = function () {
                    $tipbox.close();
                };

                booksView.getBooks(0, callback);
            },

            /**
             * feed列表
             * @param e
             */
            getMovies: function ( evt ) {
                evt.stopPropagation();
                evt.preventDefault();
                
                this.switchView(1);

                var _this = this;
                var moviesView = _this.options.moviesView;
                var callback = function () {
                    $tipbox.close();
                };

                // loading
                if (moviesView) moviesView.getMovies( 0, callback);
            },

            getOnlines: function ( evt ) {
                evt.stopPropagation();
                evt.preventDefault();

                var _this = this;

                this.switchView(3);

                if (!this.options.onlinesView) this.options.onlinesView = new Onlines;
                var onlinesView = _this.options.onlinesView;
            },

            /**
             * 页面切换
             * @param next
             */
            switchView: function (next) {
                var options = this.options;
                var current = options.current;

                var index = $(".J_index");
                var indexList = $('.J_index_list');
                var moviesArea = $(".J_movies_area");
                var booksArea = $(".J_books_area");
                var onlinesArea = $(".J_onlines_area");

                // DOM 结构清理
                var movies = $('.J_movies');
                var books = $('.J_books');
                var onlines = $('.J_onlines');

                if (next && current !== next) {
                    index.find(".current").removeClass('current');

                    switch (next) {
                        case 1: //切换到feed列表
                            $(".J_nav_movies").addClass('current');

                            if (current === 2) {
                                booksArea.addClass('next');
                            } else {
                                onlinesArea.addClass('next');
                            }

                            moviesArea.addClass('in');

                            setTimeout(function () {
                                    if (current === 2) {
                                        booksArea.removeClass('now');
                                        // books.html('');
                                    } else {
                                        onlinesArea.removeClass('now');
                                        booksArea.addClass('next');
                                        //onlines.html('');
                                    }

                                    moviesArea.removeClass('prev in').addClass('now');
                                },
                                100
                            );

                            break;

                        case 2:  //切换到资讯列表
                            $(".J_nav_books").addClass('current');

                            if (current === 1) {
                                moviesArea.addClass('prev');
                            } else {
                                onlinesArea.addClass('next');
                            }

                            booksArea.addClass('in');

                            setTimeout(function () {
                                    if (current === 1) {
                                        moviesArea.removeClass('now').addClass('prev');
                                        movies.html('');
                                    } else {
                                        onlinesArea.removeClass('now');
                                        //onlines.html('');
                                    }

                                    booksArea.removeClass('next prev in').addClass('now');

                                    indexList.position().top = 0;
                                },
                                100
                            );

                            break;

                        case 3: //切换到消息列表
                            $(".J_nav_onlines").addClass('current');

                            if (current === 1) {
                                moviesArea.addClass('prev');
                            } else {
                                booksArea.addClass('prev');
                            }

                            onlinesArea.addClass('in');

                            setTimeout(function () {
                                    if (current === 1) {
                                        moviesArea.removeClass('now');
                                        booksArea.removeClass('next').addClass('prev');
                                        movies.html('');
                                    } else {
                                        booksArea.removeClass('now').addClass('prev');
                                        books.html('');
                                    }

                                    onlinesArea.removeClass('next in').addClass('now');
                                },
                                100
                            );
                            break;

                        default:
                            break;
                    }

                    options.prev = options.current;
                    options.current = next;

                    if (next !== 3 && $tipbox) $tipbox.show({type: 'load', str: "努力加载中.."});
                }
            }

        });

        return new Index;

    });