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
            pageSize: 6,
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
                {'q': q, 'tag': tag, 'start': start, 'count': pageSize, apikey:'0c9ca568e0e58e2025d5f03aa2b0aa60' }, 
                function( json ) {
                if( json ) {
                    var data = json.books;
                  
                    _.each( data, function(item){
                        var img = new Image();
                        img.src = item.images["large"];

                    });

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

                var xOffset = Math.abs(offset['X']) || 0;
                // 向下滑动 增加开关量 做限制
                if ( !this.isLoading && offset['Y'] < 0  && Math.abs( offset['Y'] + xOffset ) > 10 ) {
                    var wrapper = this.el;
                    if( wrapper.scrollHeight - wrapper.clientHeight - wrapper.scrollTop < wrapper.clientHeight ) {
                        this.getMore( event );
                    }
                }
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
                if( wrapper.scrollHeight - wrapper.clientHeight - wrapper.scrollTop < wrapper.clientHeight ) {
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