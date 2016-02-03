/**
 * @desc M版utils模块
 *
 * @created 2015.4.23
 * @update 2015.4.23
 */

define( 'util', function () {
    var util = {
        /**
         *1、 < 60s, 显示为“刚刚”
         *2、 >= 1min && < 60 min, 显示与当前时间差“XX分钟前”
         *3、 >= 60min && < 1day, 显示与当前时间差“今天 XX: XX”
         *4、 >= 1day && < 1year, 显示日 期“XX月 XX日 XX: XX”
         *5、 >= 1year, 显示具体日 期“XXXX年XX月 XX日 XX: XX”
         */
        timeFormat: function (time) {
            var date = new Date(time),
                curDate = new Date() ,
                year = date.getFullYear() ,
                month = date.getMonth() + 1,
                day = date.getDate() ,
                hour = date.getHours() ,
                minute = date.getMinutes() ,
                curYear = curDate.getFullYear() ,
                curHour = curDate.getHours() ,
                timeStr;

            minute = minute > 10 ? minute : '0' + minute;
            if (year < curYear) {
                timeStr = year + '年' + month + '月' + day + '日 ' + hour + ':' + minute;
            } else {
                var pastTime = curDate - date,
                    pastH = pastTime / 3600000;

                if (pastH > curHour) {
                    timeStr = month + '月' + day + '日 ' + hour + ':' + minute;
                } else if (pastH >= 1) {
                    timeStr = '今天 ' + hour + ':' + minute;
                } else {
                    var pastM = curDate.getMinutes() - minute;
                    if (pastM > 1) {
                        timeStr = pastM + ' 分钟前';
                    } else {
                        timeStr = ' 刚刚';
                    }
                }
            }

            return timeStr;
        },

        /**
         * 图片预加载
         * @param src
         */
        loadImg: function (src) {
            if (!src)  return;

            var fixWidth = lib.flexible.rem2px(7);
            var fixHeight = lib.flexible.rem2px(5.25);
            var preloadImg = new Image();
            var selector = '.J_feed_img[data-src="' + src + '"]';

            preloadImg.onload = function () {
                preloadImg.onload = null;
                var imgEl = $( selector );

                var standardRatio = 5.25/7;
                fixWidth = fixWidth || 212;
                fixHeight = fixHeight || 159;

                var width = imgEl.width() || fixWidth;
                var height = imgEl.height() || fixHeight;
                var origiRatio = height / width;

                // 特别小的图标
                if ( width < 100 && height < 100 ) {
                    imgEl.attr('width', width).attr('height', height);
                } else if ( standardRatio < origiRatio ) {
                    // 高比较大
                    var reHeight =  fixWidth * height / width;
                    imgEl.attr( 'width', fixWidth);
                    imgEl.attr('height', reHeight );
                } else if ( origiRatio < standardRatio ) {
                    // 宽大很多
                    var reWidth = fixHeight * width / height;
                    var marginLeft = (fixWidth - reWidth) / 2;
                    imgEl.attr( 'height', fixHeight );
                    imgEl.attr('width', reWidth);
                    imgEl.css( 'marginLeft', marginLeft );
                } else {
                    // 宽 高 相似
                    imgEl.attr( 'width', fixWidth);
                    imgEl.attr('height', fixHeight );
                }
            };

            preloadImg.src = src;
        }
    }

    return util;

});
