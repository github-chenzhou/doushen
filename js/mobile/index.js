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