/**
 * @fileoverview 1.防止同一个ajax同时发送多次 2自动处理跨域请求 3.用ajaxform处理post的跨域请求
 * @author houyulei
 * @example Ajax.get('url','data=1',function(){});用法同jQuery的AJAX api一致
 */
define(function (require, exports, module) {
    var Uri = require('uri');
    // var secret = require('modules/yinyuetai/secret');

    var _requestList = [];
    var equal = function (obj1, obj2) {
        if (typeof (obj1) === 'string' && typeof (obj2) === 'string') {
            return obj1 === obj2;
        } else if (typeof (obj1) === 'object' && typeof (obj2) === 'object') {
            return $.param(obj1) === $.param(obj2);
        }
        return false;
    };

    var isCrossDomain = function (url) {
        var uri = new Uri(url);
        var host = uri.host();
        return uri.protocol() !== '' && host !== '' && host !== document.domain;
    };

    var createPostForm = function (settings) {
        var $form = $('<form method="post"></form>').attr({
            'action': settings.url
        }).appendTo(document.body);
        var data = settings.data || '', datas, dataJSON = {};

        if (typeof data === 'string') {
            datas = data.split('&');
            $.each(datas, function (index, item) {
                item = item.split('=');
                dataJSON[item[0]] = item[1];
            })
        } else {
            dataJSON = data;
        }
        $.each(dataJSON, function (key, value) {
            $('<input type="hidden"/>').attr({
                name: key,
                value: value
            }).appendTo($form);
        });

        return $form;
    };

    var crossDomainPost = function (settings) {
        var AjaxForm = require("ajaxform");

        var $form = createPostForm(settings);

        new AjaxForm($form, {
            // secretParam : settings.secretParam || function() {
            // return [];
            // },
            onComplete: function (result) {
                $($form.attr('target')).remove();
                $form.remove();
                if (settings.success) {
                    settings.success(result);
                }
                if (_.isFunction(settings.complete)) {
                    settings.complete(result);
                } else if (_.isArray(settings.complete)) {
                    _.each(settings.complete, function (fun) {
                        fun(result);
                    })
                }
            }
        });
        $form.submit();
    };

    var beforeSend = function (settings) {
        for (var i = 0, len = _requestList.length; i < len; i++) {
            var _request = _requestList[i];
            if (settings.url == _request.url
                && equal(_request.data, settings.data)) {
                return false;
            }
        }
        _requestList.push(settings);

        var _type = settings.type.toLowerCase();
        if (isCrossDomain(settings.url)) {
            if (_type === 'post') {
                crossDomainPost(settings);
                return false;
            } else {
                settings.dataType = "jsonp";
            }
        } else if (_type === 'post') {
//            var json = encrypt(settings.secretName, settings.secretParam);
//            if (json) {
//                if (settings.data) {
//                    if (typeof settings.data === 'string') {
//                        settings.data += '&' + $.param(json);
//                    } else {
//                        settings.data = $.extend(settings.data, json);
//                    }
//                } else {
//                    settings.data = json;
//                }
//            }
        }
        return settings;
    };

    // var encrypt = function(secretName, secretParam) {
    // if (secret[secretName]) {
    // return secret[secretName](secretParam());
    // }
    // return null;
    // /*return require(['modules/yinyuetai/secret'], function(secret) {
    // if (secret[secretName]) {
    // return secret[secretName](secretParam());
    // }
    // return null;
    // });*/
    // };

    return {
        ajax: function (options) {
            var complete = [ function () {
                _requestList = _.without(_requestList, options);
            } ];
            var success = [function (data) {
                if (data.result == 2) {
                    location.href = data.data;
                }
            }]
            if (options.complete) {
                complete = complete.concat(options.complete);
            }
            options.complete = undefined;

            if (options.success) {
                success = success.concat(options.success);
            }
            options.success = undefined;

            options = $.extend({
                timeout: 10000,
                jsonp: 'callback',
                type: 'get',
                // secretName : 'des',
                // secretParam : function() {
                // return [];
                // },
                complete: complete,
                success: success
            }, options);

            var checkResult = true;
            if (options.beforeSend && typeof options.beforeSend === "function") {
                checkResult = options.beforeSend();
            }
            if (checkResult === false) {
                return;
            }
            var settings = beforeSend(options);
            if (settings) {
                return $.ajax(settings);
            }
        },
        get: function (url, data, success, dataType) {
            var options = {
                type: 'GET'
            };
            url && (options.url = url);
            if (typeof data === "function") {
                options.success = data;
            } else if (data) {
                options.data = data;
            }
            if (typeof success === "function") {
                options.success = success;
            } else if (success) {
                options.dataType = success;
            }
            dataType && (options.dataType = dataType);
            return this.ajax(options);
        },
        getJSON: function (url, data, success) {
            return this.get(url, data, success, 'json');
        },
        post: function (url, data, success, dataType) {
            var options = {
                type: 'POST'
            };
            url && (options.url = url);
            if (typeof data === "function") {
                options.success = data;
            } else if (data) {
                options.data = data;
            }
            if (typeof success === "function") {
                options.success = success;
            } else if (success) {
                options.dataType = success;
            }
            dataType && (options.dataType = dataType);
            return this.ajax(options);
        }
    };
});
