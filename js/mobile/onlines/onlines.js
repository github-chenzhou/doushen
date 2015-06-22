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