define(function () {
    var ES = {};
    ES.getBrowserInfo=function(){
        var agent = navigator.userAgent.toLowerCase() ;
        var regStr_ie = /msie [\d.]+/gi ;
        var regStr_ff = /firefox\/[\d.]+/gi
        var regStr_chrome = /chrome\/[\d.]+/gi ;
        var regStr_saf = /safari\/[\d.]+/gi ;
        //IE
        if(agent.indexOf("msie") > 0)
        {
            return agent.match(regStr_ie) ;
        }
        //firefox
        if(agent.indexOf("firefox") > 0)
        {
            return agent.match(regStr_ff) ;
        }
        //Chrome
        if(agent.indexOf("chrome") > 0)
        {
            return agent.match(regStr_chrome) ;
        }
        //Safari
        if(agent.indexOf("safari") > 0 && agent.indexOf("chrome") < 0)
        {
            return agent.match(regStr_saf) ;
        }
    }
    /*
     * 截取字数  n为占字符数，中文占2个字符；如 截取5个中文字 则n为10
     */
    ES.cutString = function (str, n) {
        var strReg = /[\u4e00-\u9fa5]/g;  //中文正则
        var _str = str.replace(strReg, "**");
        var _len = _str.length;
        if (_len > n) {
            var char_length = 0;
            for (var i = 0; i < str.length; i++){
                var son_char = str.charAt(i);
                encodeURI(son_char).length > 2 ? char_length += 2 : char_length += 1;
                if(char_length>=n){
                    return str.substr(0,i+1)+'...';
                    break;
                }
            }
        } else {
            return str;
        }
    }
    /**
     * 底部高度自适应
     * box为需要设置最小高度元素的选择器
     */
    ES.setMinHeight = function (box) {
        var $footer = $(".platform_footer");
        $footer.removeAttr("style");
        var margin = parseInt($(box).css('marginTop')) + 90;
        var padding = parseInt($(box).css('paddingTop')) + parseInt($(box).css('paddingBottom'));
        var top = $(box).offset().top;      //盒子上边缘(有margin则为margin上边缘)距顶部的距离
        var cHeight = $(box).height();      //盒子的高度(不包括padding、margin)
        var otherH = top + margin + padding;     //盒子之外的内容高度度
        countHeight();
        $(window).resize(function () {
            countHeight();
        });

        function countHeight() {
            var sHeight = $(window).height();   //屏幕的高度
            if ((otherH + cHeight) < sHeight) {
                if ($.browser.msie && ($.browser.version == "6.0")) {
                    $(box).css({"height": "auto !important", "height": sHeight - otherH});
                } else {
                    $(box).css({"min-height": sHeight - otherH});
                }
            }
        }
    }

    /**
     *转换long值为日期字符串
     * @param l long值
     * @param fmt 日期数据格式, 默认格式如"2014-06-18 23:05:04"
     * @return 符合要求的日期字符串
     */
    ES.getFormatDateByLong = function (l, fmt) {
        var date = new Date(l);
        if (date == undefined) {
            date = new Date();
        }
        return date.Format(fmt);
    }

    /** * 对Date的扩展，将 Date 转化为指定格式的String * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q)
     可以用 1-2 个占位符 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
     * eg:
     * (newDate()).Format("yyyy-MM-dd hh:mm:ss.S")==> 2006-07-02 08:09:04.423
     * (new Date()).Format("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04
     * (new Date()).Format("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04
     * (new Date()).Format("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04
     * (new Date()).Format("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
     */
    Date.prototype.Format = function (fmt) {
        fmt = fmt || "yyyy-MM-dd HH:mm:ss";
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时
            "H+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        var week = {
            "0": "/u65e5",
            "1": "/u4e00",
            "2": "/u4e8c",
            "3": "/u4e09",
            "4": "/u56db",
            "5": "/u4e94",
            "6": "/u516d"
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[this.getDay() + ""]);
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    };

    /*
     * 获取文字长度
     */
    ES.getTextLength = function (obj) {
        if (obj.tagName == "TEXTAREA" || obj.tagName == "INPUT") {
            return $.trim($(obj).val()).length;
        } else {
            return $.trim($(obj).text()).length;
        }
    }

    /*
     * 截取文字
     */
    ES.cutText = function (obj, num) {
        if (obj.tagName == "TEXTAREA" || obj.tagName == "INPUT") {
            if ($(obj).val().length > num) {
                $(obj).val($(obj).val().substring(0, num));
            }
        } else {
            if ($(obj).text().length > num) {
                $(obj).text($(obj).text().substring(0, num));
            }
        }

    }

    /*
     * 粘帖
     */
    ES.textPaste = function (box, numbox, num, hasEnter) {
        var length = getTextLength(box);
        var $num = $(box).parent().find(numbox).length > 0 ? $(box).parent().find(numbox) : $(box).parent().parent().find(numbox);
        setTimeout(function () {
            var length = getTextLength(box);
            if (length > num) {
                ES.cutText(box, num);
                if (hasEnter == "entered") {
                    $num.text(num);
                } else {
                    $num.text(0);
                }
            } else {
                if (hasEnter == "entered") {
                    $num.text(length);
                } else {
                    $num.text(num - length);
                }
            }
        }, 10);
    }
    /*
     * 评论字数限制
     * 参数hasEnter 为"entered" 显示已输入字数，"canEnter" 显示还可输入数字
     */
    ES.commentsWords = function (box, numbox, num, hasEnter) {
        $(box).live("keydown", function (event) {
            var $num = $(this).parent().find(numbox).length > 0 ? $(this).parent().find(numbox) : $(this).parent().parent().find(numbox);
            var length = 0;
            textevent = event;
            length = ES.getTextLength(this);
            if (num - length > 0) {
                if (hasEnter == "entered") {
                    $num.text(length);
                } else {
                    $num.text(num - length);
                }
            } else {
                if (textevent.which != 8 && textevent.which != 46) {
                    textevent.preventDefault();
                }
            }
        }).live("keyup", function () {
            var $num = $(this).parent().find(numbox).length > 0 ? $(this).parent().find(numbox) : $(this).parent().parent().find(numbox);
            var length = 0;
            length = ES.getTextLength(this);
            if (num - length >= 0) {
                if (hasEnter == "entered") {
                    $num.text(length);
                } else {
                    $num.text(num - length);
                }
            } else {
                ES.cutText(this, num);
            }
        }).live("mousedown", function () {
            $(this).attr('onpaste', 'ES.textPaste(this,"' + numbox + '","' + num + '","' + hasEnter + '")');
        });
    }
    /*
     * 点击回复评论
     */
    ES.replay = function(btn,url){
        if($(".replyIpt").length>0){
            $(".replyIpt").remove();
        }
        var html = '';
        html  = '<dl class="subReply replyIpt clearfix">';
        html += '<dt class="cAvatar"><img src="'+url+'" width="50" height="50" /></dt>';
        html += '<dd class="replyBox">';
        html += '<div class="textArea replyArea">';
        html += '<span class="textAreaArr"></span>';
        html += '<span class="textAreaT"></span>';
        html += '<div class="textAreaC js-subTextarea" contenteditable="true"></div>';
        html += '<span class="textAreaB"></span>';
        html += '<span class="tiptext">我要回复</span>';
        html += '</div>';
        html += '<div class="textAreaTips mt10"><a href="javascript:;" class="fr publishBtn">提交</a><span class="wordTips">还可以输入</span><span class="wordNum">300</span>个字</div>';
        html += '</dd>';
        html += '<span class="replyArrow"></span>';
        html += '</dl>';
        var $itemBox = $(btn).parents(".replyItem");
        $itemBox.after(html);
        //回复,动态添加完后再执行此代码
        $(".js-subTextarea").replyBox({
            par: ".replyArea",
            currClass: "replyAreaH",
            posL: "14px"
        });
    }

    /**
     * 级联日期框
     * @param startId 开始日期的标识，必填；可以是id、name、对象；
     * @param endId 结束日期的标识，必填，可以是id，name，对象
     * @param dateFormat 日期格式化
     * @param minDate 最小日期，可为空
     * @param maxDate 最大日期，可为空
     * @author Jianpin.Li
     */
    ES.dateCascade = function (startId, endId, dateFormat, minDate, maxDate) {
        var startObj;
        var endObj;
        if (typeof startId === "string") {
            startObj = $("#" + startId);
            endObj = $("#" + endId);

            if (!startObj[0]) {
                startObj = $("[name=" + startId + "]");
                endObj = $("[name=" + endId + "]");
            }
        } else if (typeof startId === "object") {
            startObj = $(startId);
            endObj = $(endId);
        } else {
            alert("方法【dateCascade】输入参数错误！");
        }
        dateFormat = dateFormat || "yyyy-MM-dd";

        startObj.each(function (i) {
            var me = $(this);
            var tmpEndId = endObj.eq(i).attr("id");
            me.on("focus", function () {
                var endtimeTf = $dp.$(tmpEndId);
                var opts = {
                    isShowClear: true, dateFmt: dateFormat, onpicked: function (dp) {
                        endtimeTf.focus();
                    }
                }
                if (minDate) {
                    opts.minDate = minDate;
                }
                opts.maxDate = maxDate ? maxDate : '#F{$dp.$D(\'' + tmpEndId + '\')}';
                WdatePicker(opts);
//                if (minDate && maxDate) {
//                    WdatePicker({
//                        isShowClear: true, dateFmt: dateFormat, onpicked: function () {
//                            endtimeTf.focus();
//                        }, maxDate: maxDate, minDate: minDate
//                    });
//                } else {
//                    WdatePicker({
//                        isShowClear: true, dateFmt: dateFormat, onpicked: function () {
//                            endtimeTf.focus();
//                        }, maxDate: '#F{$dp.$D(\'' + tmpEndId + '\')}'
//                    });
//                }
            });
        });

        endObj.each(function (i) {
            var me = $(this);
            var tmpStartId = startObj.eq(i).attr("id");
            me.on("focus", function () {
                //new 150407
                var min = $dp.$D(tmpStartId) ? '#F{$dp.$D(\'' + tmpStartId + '\')}' : minDate;
                if (minDate && maxDate) {
                    WdatePicker({isShowClear: true, dateFmt: dateFormat, maxDate: maxDate, minDate: min});
                } else {
                    WdatePicker({isShowClear: true, dateFmt: dateFormat, minDate: min});
                }
                //old
                /*if (minDate && maxDate) {
                    WdatePicker({isShowClear: true, dateFmt: dateFormat, maxDate: maxDate, minDate: '#F{$dp.$D(\'' + tmpStartId + '\')}'});
                } else {
                    WdatePicker({isShowClear: true, dateFmt: dateFormat, minDate: '#F{$dp.$D(\'' + tmpStartId + '\')}'});
                }*/
            });
        });
    }
    //将用户输入内容中的尖括号、引号等进行转义
    ES.html_encode=function(str){
        var s = "";
        if (str.length == 0) return "";
        s = str.replace(/&/g, "&gt;");
        s = s.replace(/</g, "&lt;");
        s = s.replace(/>/g, "&gt;");
        s = s.replace(/ /g, "&nbsp;");
        s = s.replace(/\'/g, "&#39;");
        s = s.replace(/\"/g, "&quot;");
        s = s.replace(/\n/g, "<br>");
        return s;
    }
    return ES;
});
