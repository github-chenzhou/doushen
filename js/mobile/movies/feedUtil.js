/**
 * @desc M版feed utils操作封装模块
 *
 * @created 2015.5.13
 * @update 2015.5.13
 */

define( 'feedUtil', ['util'], function (util) {
    var feedUtil = {
        formatData: function (obj) {
            var _this = this;
            var feed = obj.fdjson;

            obj.fdjson.contentMap = JSON.parse(feed.contentMap);
            obj.nativeCreateTime = util.timeFormat(parseInt(obj.nativeCreateTime, 10));

            if (obj.fdType) {
                //contentMap: "{"grade":"1年级   数学","leader":"主备人:晋中管理员","time":"2015年03月29日 - 2015年04月03日"}"
                switch (obj.fdType) {
                /**主题类型 -应用 0 */
                    case '0' :
                        if (feed.appcode) {
                            switch (feed.appcode) {
                            /**应用类型 -微课：WEEK  课程：LESSON */
                                case 'WEEK', 'LESSON' :
                                    /*
                                     iconUrl: "402883694005724d01400586jinzhong/e296014c7307c4fd37d1c284188e687e.jpg"
                                     intro: ""
                                     studyCount: "0"
                                     synthesisScore: "0.0"
                                     */

                                    if (feed.contentMap) {
                                        feed.isWEEK = true;
                                        feed.isVideo = true;
                                        var contentMap = feed.contentMap;
                                        var temp = '/uploads/honeybee/data/upload/video/' + contentMap.iconUrl;

                                        var iconUrl = contentMap.iconUrl;
                                        var isOnlineViedo = iconUrl.indexOf('cross-url');

                                        if (isOnlineViedo > -1) temp = iconUrl;

                                        feed.imgs = [temp];
                                    }

                                    break;

                            /**应用类型 -集备: CAMEL */
                                case 'CAMEL' :
                                    feed.hasExpand = true;

                                    if (feed.contentMap.time) {

                                        var time = feed.contentMap.time;
                                        time = time.replace(/\u5E74|\u6708/g, '.');
                                        feed.contentMap.time = time.replace(/\u65E5|\s/g, '');
                                    }

                                    if (feed.contentMap.content) {
                                        feed.contentMap.leader = feed.contentMap.content;
                                    }

                                    break;

                            /**应用类型 -评课议课 EVALUATION */
                                case 'EVALUATION':
                                    feed.hasExpand = true;
                                    //shoukeren: "授课人:晋中管理员"
                                    //shoukeshijian: "授课时间:2015-03-10"
                                    feed.contentMap.time = feed.contentMap.shoukeshijian;
                                    feed.contentMap.leader = feed.contentMap.shoukeren;
                                    feed.contentMap.grade = '';
                                    break;

                            /** 问卷 BLACKCAT */
                                case 'BLACKCAT':
                                    feed.fdSummary = feed.contentMap && feed.contentMap.content || '';
                                    break;

                                default :
                                    feed.fdSummary = feed.fdContent;
                                    break;
                            }
                        }

                        break;
                /**主题类型 -文章 3 */
                    case '3' :
                        feed.fdSummary = feed.fdContent;
                        feed.feedAction = '发表了文章';
                        break;
                /**主题类型 -图片 11*/
                    case '11' :
                        /**
                         * 图片类型分为 个人:1  容器:2  应用类型:3
                         * 三种类型 对应三个接口 参数不同
                         * @type {string}
                         */
                        var picType = 1;
                        var content = feed.fdContent || '';
                        var feedIdExt = picType;

                        feed.feedAction = '上传了图片';
                        feed.hasImgs = true;
                        feed.objId = feedIdExt + '-' + feed.objId;

                        // 容器
                        if (parseInt(feed.containerId, 10) > 0) {
                            feedIdExt = picType = 2;
                            feedIdExt = feedIdExt + '-' + feed.containerId + '-' + feed.containerType;
                            feed.objId = feedIdExt + '-' + feed.containerObjId;
                        }

                        // TODO: 应用

                        //feed.isTrans
                        var userId = feed.userId;
                        if (parseInt(feed.isTrans, 10)) userId = feed.transUserId;

                        //应用 fdContent: "fc72014ce4fdc86e2ee333cdf9c3589b.jpeg-92-2269,8355014ce4fdc4871bed74796464be77.jpeg-93-2269"
                        //容器 fdContent: "f8a2014c30e3a8a9be2b468c5198cc0a.jpeg-529189,145e014c30e39881ef22b0038b96f218.jpeg-529186"
                        var temp = content.split(',');
                        feed.imgs = [].map.call(temp, function (obj) {
                            var picInfo = obj.split('-');
                            var src = '/uploads/honeybee/data/upload/photo/' + userId + '/s_' + picInfo[0];
                            var phtotoId = picInfo[1] || '';

                            // 预加载图片
                            util.loadImg(src, src);

                            return { src: src, phtotoId: feedIdExt + '-' + phtotoId };
                        });

                        break;

                /**主题类型 -资源 12 */
                    case '12' :
                        feed.feedAction = '发布了资源';
                        //资源类型
                        var content = feed.fdContent || '';

                        break;

                /**主题类型 -视频 17 */
                    case '17' :
                        //1、上传的视频 2、线上的视频
                        ///honeybee/cross-url.do?img="
                        feed.feedAction = '发布了视频';
                        feed.isVideo = true;

                        var temp = '';
                        var content = feed.fdContent || '';
                        var isOnlineViedo = content.indexOf('cross-url');

                        if (isOnlineViedo === -1) {
                            //feed.isTrans
                            var userId = feed.userId;
                            if (parseInt(feed.isTrans, 10)) userId = feed.transUserId

                            //fdContent: "100f014cb16447d46a23332c5b0fabab.jpg"
                            temp = '/uploads/honeybee/data/upload/video/' + userId + '/' + content;
                        } else {
                            temp = content;
                        }

                        feed.imgs = [temp];

                        break;

                /**主题类型 -音频 30*/

                /**主题类型 -话题 31*/
                    case '31' :
                        feed.feedAction = '发表了话题';

                        break;

                /**主题类型 -说说 32*/
                    case '32' :
                        feed.feedAction = feed.feedAction || '发表了说说';

                        var content = feed.fdContent || '';
                        if (!content) return;

                        // f28d014d26a642f70a51085be014924a.jpeg,c8fa014d26a635c7770fb1880b45a1fa.jpeg
                        var temp = content.split(',');

                        if (temp && temp.length > 0) {
                            feed.hasImgs = true;

                            //feed.isTrans
                            var userId = feed.userId;
                            if (parseInt(feed.isTrans, 10)) userId = feed.transUserId;

                            // 先设置一个data-id=id+src  src=loading.gif  data-src=src
                            feed.imgs = [].map.call(temp, function (pic) {
                                if (!pic) return;

                                if (pic && pic.indexOf('s_') === -1) pic = 's_' + pic;
                                var src = '/uploads/honeybee/data/upload/talkShow/' + userId + '/' + pic;
                                // 预加载图片
                                util.loadImg(src, src);

                                return { src: src };
                            });
                        }

                        break;
                /**主题类型 -试卷 33*/
                /**主题类型 -试题 34*/
                }

            }

        }
    };

    return feedUtil;

});
