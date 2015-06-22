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