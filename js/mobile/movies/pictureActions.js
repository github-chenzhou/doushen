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
