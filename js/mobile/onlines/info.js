/**
 * @desc M版详情模块
 *
 * @created 2015.4.28
 * @update 2015.4.28
 */

define(['js/mobile/url_config', 'juicer', 'js/mobile/template', 'ajax', 'js/mobile/common/util'],
    function($config, juicer, tpl, Ajax, util) {

        /**
         *  @module 详情
         *  @desc 消息评论列表 消息粉丝列表 系统消息列表
         */
        var Info = Backbone.View.extend({
            events:{
                'click .J_comments_more': 'getMoreComments',
                'click .J_follows_more': 'getMoreFollows',
                'click .J_privates_more': 'getMorePrivates',
                'click .J_sys_msgs_more': 'getMoreSys',
                'click .J_msginfo_back': 'backTo'
            },

            config: {
                pageNo: 1,
                pageSzie: 10,
                // news:资讯详情  msgs:消息列表  indexFeed:首页feed  space: 空间feed
                prev: '',
                current: ''
            },

            initialize: function (options) {
                var _this = this;
            },

            /**
             * 消息类型列表展示
             * @param type
             * @param callback
             */
            getMsgList: function(type, callback, friendId) {
                var _this = this;
                var pageNo = _this.config.pageNo = 1;
                var pageSzie = _this.config.pageSzie || 10;

                _this.config.prev =_this.config.current;
                _this.config.current = 'msgs';

                // 详情视图中显示
                switch(type){
                    case 'comment':
                        Ajax.get($config.INDEX.GET_INDEX_MSGS_COMMENTS,
                            { 'keyWord': '', 'pageNo': pageNo, 'pageSize': pageSzie}, function(json) {
                            if(json.result === 1) {
                                var data = json.data.pageInfo && json.data.pageInfo.data;

                                // 格式化数据
                                $.each(data, function(index, obj) {
                                    obj.templateInfo = JSON.parse(obj.templateInfo);

                                    obj.from = obj.containerName || obj.appObjName + ' '
                                       + obj.templateInfo.title;

                                    obj.createDate = util.timeFormat(parseInt(obj.createDate ,10));
                                });

                                // render
                                $('.J_info').html(juicer(tpl.MESSAGES_COMMENT_TPL, {}));
                                $('.J_comments').html(juicer(tpl.MESSAGES_COMMENT_LIST_TPL, {list: data}));
                                if( data.length < 10 ) $('.J_comments_more').hide();

                                if(callback) callback({});
                            }
                        });

                        break;

                    case 'follow':
                        Ajax.get($config.INDEX.GET_INDEX_MSGS_FOLLOWS,
                            {'pageNo': pageNo, 'pageSize': pageSzie, 'searchFollowedType': 0 },
                            function(json) {
                                if(json.result === 1) {
                                    var data = json.data.data;

                                    // render
                                    $('.J_info').html(juicer(tpl.MESSAGES_FOLLOW_TPL, {}));
                                    $('.J_follows').html(juicer(tpl.MESSAGES_FOLLOW_LIST_TPL, {list: data}));
                                    if( data.length < 10 ) $('.J_follows_more').hide();

                                    if(callback) callback({});
                                }
                            });
                        break;

                    case 'sys':
                    case 'apply':
                        var msgType = type === 'sys' ? 0 : 1;
                        Ajax.get($config.INDEX.GET_INDEX_MSGS_SYSTEM,
                            {'msgType': msgType, 'pageNo': pageNo, 'pageSize': pageSzie },
                            function(json) {
                                if(json.result === 1) {
                                    var data = json.data.pageInfo.data;

                                    // 格式化数据
                                    $.each(data, function(index, obj) {
                                        obj.sendTime = util.timeFormat(parseInt(obj.sendTime ,10));
                                    });

                                    // render
                                    var title = msgType ? '应用消息' : '系统消息';
                                    $('.J_info').html(juicer(tpl.MESSAGES_SYS_TPL, {title: title}));
                                    $('.J_sys_msgs').html(juicer(tpl.MESSAGES_SYS_LIST_TPL, {list: data}));
                                    if( data.length < 10 ) $('.J_sys_msgs_more').hide();

                                    if(callback) callback({});
                                }
                            });
                        break;

                    case 'private':
                        Ajax.get($config.INDEX.GET_INDEX_PRIVATE_MSGS,
                            {'friendId': friendId, 'friendName': '', 'pageNo': pageNo, 'pageSize': pageSzie},
                            function(json) {
                                if(json.result === 1) {
                                    var data = json.data.pageInfo.data;

                                    // 格式化数据
                                    $.each(data, function(index, obj) {
                                        obj.sendTime = util.timeFormat(parseInt(obj.sendTime ,10));
                                    });

                                    // render
                                    $('.J_info').html(juicer(tpl.MESSAGES_PRIVATE_TPL, {}));
                                    $('.J_privates').html(juicer(tpl.MESSAGES_PRIVATE_LIST_TPL, {list: data}));
                                    if( data.length < 10 ) $('.J_privates_more').hide();
                                }
                            });
                        break;

                    default : break;
                }
            },

            getMoreComments:function(e) {
                var _this = this;
                var pageNo = ++_this.config.pageNo;
                var pageSzie = _this.config.pageSzie || 10;

                Ajax.get($config.INDEX.GET_INDEX_MSGS_COMMENTS,
                    { 'keyWord': '', 'pageNo': pageNo, 'pageSize': pageSzie}, function(json) {
                        if(json.result === 1) {
                            var data = json.data.pageInfo && json.data.pageInfo.data;

                            // 格式化数据
                            $.each(data, function(index, obj) {
                                obj.templateInfo = JSON.parse(obj.templateInfo);

                                obj.from = obj.containerName || obj.appObjName || '' + ' '
                                    + obj.templateInfo.title;

                                obj.createDate = util.timeFormat(parseInt(obj.createDate ,10));
                            });

                            // render
                            $('.J_comments').append(juicer(tpl.MESSAGES_COMMENT_LIST_TPL, {list: data}));
                        }
                });
            },

            getMoreFollows:function(e) {
                var _this = this;
                var pageNo = ++_this.config.pageNo;
                var pageSzie = _this.config.pageSzie || 10;

                Ajax.get($config.INDEX.GET_INDEX_MSGS_FOLLOWS,
                    {'pageNo': pageNo, 'pageSize': pageSzie, 'searchFollowedType': 0 },
                    function(json) {
                        if(json.result === 1) {
                            var data = json.data.data;

                            // render
                            $('.J_follows').append(juicer(tpl.MESSAGES_FOLLOW_LIST_TPL, {list: data}));
                        }
                });

            },

            // TODO:
            getMorePrivates: function(e) {
            },

            // TODO
            getMoreSys: function(e) {
                var _this = this;
                var pageNo = ++_this.config.pageNo;
                var pageSzie = _this.config.pageSzie || 10;
                var type = _this.config.current;

                var msgType = type === 'sys' ? 0 : 1;
                Ajax.get($config.INDEX.GET_INDEX_MSGS_SYSTEM,
                    {'msgType': msgType, 'pageNo': pageNo, 'pageSize': pageSzie },
                    function(json) {
                        if(json.result === 1) {
                            var data = json.data.pageInfo.data;

                            // 格式化数据
                            $.each(data, function(index, obj) {
                                obj.sendTime = util.timeFormat(parseInt(obj.sendTime ,10));
                            });

                            // render
                            $('.J_sys_msgs').append(juicer(tpl.MESSAGES_SYS_LIST_TPL, {list: data}));
                        }
                });
            },

            reset: function() {
            },

            // TODO
            backTo: function() {
                var _this = this;
                var current = _this.config.current;
                var currentRecordId = '';
                var info = $('.J_info');
                var index = $('.J_index');

                if (current ){
                    switch( current ) {
                        // 返回首页feeds
                        case 'indexFeed' :
                            currentRecordId = $Index.config.feedsView.config.currentRecordId;
                            break;
                    }

                    info.addClass('show out');
                    index.show().addClass('old_page in');

                    setTimeout( function() {
                            info.removeClass('current show out');
                            index.removeClass('old_page in').show();

                            $appRouter.navigate("#", {trigger: false, replace: true});
                            if(currentRecordId) document.getElementById(currentRecordId).scrollIntoView();
                            // 清理详情结构
                            info.html('');
                        },
                        400
                    );

                }

            }

        });

        return Info;

    });