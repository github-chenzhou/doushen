/**
 * @desc M版空间模块
 *
 * @created 2015.4.29
 * @update 2015.4.29
 */

define([ 'js/mobile/url_config', 'juicer', 'js/mobile/template', 'ajax', 'js/mobile/common/util', 'js/mobile/feeds/feedUtil' ],
    function ($config, juicer, tpl, Ajax, util, feedUtil) {

        /**
         *  @module 空间
         *  @desc 我的空间
         *        个人空间
         */
        var Space = Backbone.View.extend({
            events: {
                'click .J_spaces_more': 'getMore',
                'click .J_logout': 'logout',
                'click .J_space_nav_feed': 'getMyFeeds',
                'click .J_space_nav_collection': 'getMyCollection',
                'click .J_back_index': 'back2Index'
            },

            config: {
                pageNo: 1,
                pageSzie: 10,

                prevView: null,

                // 动态: feed  收藏:collection
                current: 'feed',

                // 登录用户ID
                loginUserId: '',

                currentUserId: '',

                // 标记详情recordId
                currentRecordId: '',

                // 统计信息参数
                statisticsParams: []
            },

            initialize: function (options) {
                //_.extend(this.options, options);
                var _this = this;
                _this.config.loginUserId = options.loginUserId;

                this.el.addEventListener('touchstart', this, false);
            },

            /**
             *
             * @param pageNo
             */
            getFeeds: function (pageNo, userId, callback) {
                var _this = this;
                var pageNo = pageNo || 1;

                Ajax.get($config.INDEX.GET_SPACE_FEED, {'userId': userId, 'feedPage.pageNo': pageNo},
                    function (json) {
                        if (json.result === 1) {
                            var data = json.data && json.data.feedContentList;

                            _this.formatData(data);

                            if (pageNo === 1) {
                                _this.render(data);
                            } else {
                                _this.append(data);
                            }

                            if (typeof callback === 'function') callback();

                            // 统计信息
                            var params = _this.config.statisticsParams;
                            _this.getStatisticsInfo(params);
                        }
                    });
            },

            getUserInfo: function (userId) {
                var _this = this;

                var loginUserId = _this.config.loginUserId;
                _this.config.currentUserId = userId;

                var isLoginUser = (userId === loginUserId);

                var callback = function (data) {
                    data.isLoginUser = isLoginUser;
                    $('.J_space').html(juicer(tpl.SPACE_TPL, {data: data}));

                    _this.getFeeds(1, userId);
                }

                if (isLoginUser) {
                    callback($Index.config.userInfo);
                } else {
                    Ajax.get($config.INDEX.GET_USERINFO, {'userId': userId},
                        function (json) {
                            if (json.result === 1) {
                                var data = json.data;
                                callback(data);
                            }
                        });
                }
            },

            /**
             * 格式化数据 json字符串 时间计算 自定义字段扩展
             */
            formatData: function (data) {
                var _this = this;
                //统计参数初始化
                _this.initStatisticsParams();

                $.each(data, function (index, obj) {
                    if (obj.fdjson) {
                        obj.fdjson = JSON.parse(obj.fdjson);

                        // 统计信息
                        _this.setStatisticsParam(obj);

                        feedUtil.formatData(obj);
                    }
                });
            },

            /**
             * 统计参数初始化
             */
            initStatisticsParams: function () {
                var _this = this;
                _this.config.statisticsParams = [];
            },

            setStatisticsParam: function (obj) {
                var statisticsParams = this.config.statisticsParams;
                var param = {
                    'objType': obj.fdjson.objType || 0,
                    'objId': obj.fdjson.objId || 0,
                    'userId': obj.fdjson.userId || 0,
                    'divId': 'space' + obj.feedId
                };

                statisticsParams.push(param);
            },

            getStatisticsInfo: function (params) {
                var _this = this;

                Ajax.get($config.INDEX.GET_FEED_STATISTICS, {'objInfo': JSON.stringify(params)}, function (json) {
                    if (json.result === 1) {
                        var data = json.data;

                        // 统计信息
                        $.each(data, function (index, obj) {
                            var divId = obj.divId;
                            $('#' + divId).html(juicer(tpl.FEED_STATIC_TPL, {data: obj.semantideStatistics}));
                        });

                    }
                });

            },

            /**
             * feed列表渲染
             * @param data
             */
            render: function (data) {
                $('.J_space_feeds').html(juicer(tpl.INDEX_FEED_TPL, {
                    list: data,
                    viewName: 'space'
                }));
            },

            append: function (data) {
                $('.J_space_feeds').append(juicer(tpl.INDEX_FEED_TPL, {
                    list: data,
                    viewName: 'space'
                }));
            },

            itemTap: function (type, feedId, cb) {
                var callback = function (data) {
                    if (cb) cb();
                };

                if ($Index.config.infoView) {
                    $Index.config.infoView.getFeed(type, feedId, callback, 'space');
                }
            },

            reset: function () {
                var _this = this;

                _this.config.pageNo = 1;
                _this.config.current = 'feed';
            },

            /**
             * 我的动态
             * @param e
             */
            getMyFeeds: function (e) {
                var _this = this;
                var loginUserId = _this.config.loginUserId;
                var callback = function () {
                    $tipbox.close();
                    $('.J_space_nav_collection').removeClass('current');
                    $('.J_space_nav_feed').addClass('current');
                    _this.config.current = 'feed';
                };

                $tipbox.show({type: 'load', str: "努力加载中.."});
                _this.getFeeds(1, loginUserId, callback);
            },

            getMyCollection: function (e) {
                var _this = this;
                var callback = function () {
                    $tipbox.close();
                };
                $tipbox.show({type: 'load', str: "努力加载中.."});
                _this.getCollection(1, callback);
            },

            getCollection: function (pageNo, callback) {
                var _this = this;
                var pageNo = pageNo || _this.config.pageNo;

                Ajax.get($config.INDEX.GET_SPACE_MYCOLLECTION, {'pageNo': pageNo, 'pageSize': 10},
                    function (json) {
                        if (json.result === 1) {
                            var data = json.data && json.data.data;

                            var list = _.filter(data, function (item) {
                                item.templateInfo = JSON.parse(item.templateInfo);
                                item.ctime = util.timeFormat(parseInt(item.ctime, 10));
                                return item.templateInfo.topicUserId;
                            });

                            if (pageNo === 1) {
                                $('.J_space_nav_feed').removeClass('current');
                                $('.J_space_nav_collection').addClass('current');
                                $('.J_space_feeds').html(juicer(tpl.SPACE_COLLECTION_TPL, {
                                    list: list
                                }));

                                _this.config.current = 'collection';
                            } else {
                                $('.J_space_feeds').append(juicer(tpl.SPACE_COLLECTION_TPL, {
                                    list: list
                                }));
                            }

                        }

                        if (typeof callback === 'function') callback();
                    });
            },

            getMore: function (e) {
                var _this = this;
                var pageNo = ++_this.config.pageNo;
                var currentUserId = _this.config.currentUserId;
                var current = _this.config.current;
                var callback = function () {
                    $tipbox.close();
                };

                $tipbox.show({type: 'load', str: "努力加载中.."});

                if (current && current === 'feed') {
                    _this.getFeeds(pageNo, currentUserId, callback);
                } else {
                    _this.getCollection(pageNo, callback);
                }

            },

            logout: function (e) {
                // TODO: 确认是否注销
                Ajax.get($config.INDEX.LOGOUT, { },
                    function (json) {
                        if (json.result === 1) {
                            $appRouter.navigate("#", {trigger: false, replace: true});
                            document.location.reload();
                            /*
                             $Index.config.loginView.show();
                             $('.J_index').hide();
                             $('.J_space').hide();
                             */
                        }
                    });

            },

            // TODO
            back2Index: function (e) {
                var _this = this;
                var prev = _this.config.prevView;

                _this.$el.addClass('show out');
                prev.show().addClass('old_page in');
                setTimeout(function () {
                        _this.$el.removeClass('current show out');
                        prev.removeClass('old_page in');
                        $appRouter.navigate("#", {trigger: false, replace: true});

                        // TODO 清除空间结构 需要清理DOM监听事件
                        //_this.remove();
                        _this.$el.html('');
                    },
                    500
                );

                //TODO: reset
                _this.reset();
            },

            handleEvent: function (event) {
                var _this = this;

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
                // TODO 有浏览器 不触发move 会触发其他事件
                // event.preventDefault();
                this.isMoving = true;
                this.sWidth = $(document.body).width();
                this.startTime = new Date().getTime();
                this.startX = event.touches[0].pageX || event.targetTouches[0].pageX;
                this.startY = event.touches[0].pageY || event.targetTouches[0].pageY;
                this.supportAnimations = vendor;

                // 绑定事件
                var space = this.el;
                space.addEventListener('touchmove', this, false);
                space.addEventListener('touchend', this, false);
            },

            // 移动
            move: function (event) {
                if (!event.touches || event.touches.length < 1) return;
                if (this.isMoving && this.supportAnimations !== false) {
                    var offset = {
                        X: event.targetTouches[0].pageX - this.startX,
                        Y: event.targetTouches[0].pageY - this.startY
                    };
                    // TODO: 向右滑动
                    if (Math.abs(offset['X']) - Math.abs(offset['Y']) > 10 && offset['X'] > 0) {
                        event.preventDefault();
                        var sWidth = this.sWidth;
                        var space = this.el;
                        var prevEl = this.config.prevView;
                        var prev = prevEl.get(0);
                        prevEl.show().addClass('prev show');

                        var transitionName = css3TransNames.transition;
                        var transformName = css3TransNames.transform;
                        space.style[transitionName] = 'all 0s';
                        prev.style[transitionName] = 'all 0s';
                        space.style[transformName] = 'translateX(' + (offset['X']) + 'px)';
                        prev.style[transformName] = 'translateX(' + (offset['X'] - sWidth + 10 ) + 'px)';
                    }

                    this.offset = offset;
                }
            },

            // 滑动释放
            end: function (event) {
                if (!event.touches) return;
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

                var space = this.el;
                var prevEl = this.config.prevView;
                var prev = prevEl.get(0);
                var transitionName = css3TransNames.transition;
                var transformName = css3TransNames.transform;

                // TODO 左右滑动
                if (this.supportAnimations !== false && offset['X'] >= boundary && absReverseOffset < absOffset) {
                    space.style[transitionName] = 'all 0.2s';
                    prev.style[transitionName] = 'all 0.2s';
                    space.style[transformName] = 'translateX(100%)';
                    prev.style[transformName] = 'translateX(0)';

                    setTimeout(function () {
                            _this.$el.removeClass('current');
                            prevEl.show().removeClass('hide prev show');

                            space.style[transitionName] = '';
                            space.style[transformName] = '';
                            prev.style[transitionName] = '';
                            prev.style[transformName] = '';

                            $appRouter.navigate("", {trigger: false, replace: true});
                            // 清理详情结构
                            _this.$el.html('');

                        },
                        200
                    );

                } else {
                    prevEl.removeClass('prev show').hide();
                    space.style[transitionName] = '';
                    space.style[transformName] = '';
                    prev.style[transitionName] = '';
                    prev.style[transformName] = '';
                }

                this.offset.X = this.offset.Y = 0;

                // 解绑事件
                var space = this.el;
                space.removeEventListener('touchmove', this, false);
                space.removeEventListener('touchend', this, false);
            }

        });

        return Space;

    });