/**
 * @desc movies
 *
 * @created 2015.6.22
 * @update 2015.6.22
 */

define( 'movies', ['config', 'juicer', 'template', 'ajax', 'util', 'movieInfo' ],
    function ($config, juicer, tpl, Ajax, util, info ) {
        // 
        juicer.register('setSytle', function (src) {
        	    util.loadImg(src);
                return src;
            }
        );

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
                    {'q': q, 'tag': tag, 'start': start, 'count': pageSize, apikey:'0c9ca568e0e58e2025d5f03aa2b0aa60' }, 
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
