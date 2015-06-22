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
        loadImg: function (src, dataId) {
            if (!src) {
                return;
            }
            // height / width = 075
            var standardRatio = 0.75;
            var fixWidth = 280;
            var fixHeight = 210;
            var preloadImg = new Image();
            var selector = '.feed_pic_list li img[data-id="' + dataId + '"]';

            preloadImg.onload = function () {
                preloadImg.onload = null;

                var width = preloadImg.width;
                var height = preloadImg.height;
                var origiRatio = parseFloat((height / width).toFixed(3)) * 1000;
                var minRatio = (standardRatio - 0.2) * 1000;
                var maxRatio = (standardRatio + 0.2) * 1000;
                var ratio = standardRatio * 1000;

                //console.log(selector + ' 宽高比 ' + origiRatio);
                // 特别小的图标
                if (width < 150 && height < 150) {
                    $(selector).attr('width', width).attr('height', height);
                } else if (minRatio < origiRatio && origiRatio < ratio || origiRatio > 1100) {
                    // 宽高比相似 或者 高很大
                    $(selector).attr('height', fixHeight);
                } else if (ratio < origiRatio && origiRatio < maxRatio || origiRatio < 400) {
                    // 宽高比相似 或者 宽大很多
                    $(selector).attr('width', fixWidth);
                } else {
                    // 宽大很多 // 高大很多
                    //var reHeight = height / width * fixWidth;
                    $(selector).attr('width', fixWidth);
                }
            };

            preloadImg.src = src;
        }
    }

    return util;

});
