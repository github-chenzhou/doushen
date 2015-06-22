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