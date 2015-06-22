/*transform form param string to object*/
(function ($) {
    function paramString2obj (serializedParams,options) {
        var obj={};
        function evalThem (str) {
            var attributeName = str.split("=")[0];
            var attributeValue = str.split("=")[1];
            if(!attributeValue){
                return ;
            }

            var array = attributeName.split(".");
            for (var i = 1; i < array.length; i++) {
                var tmpArray = Array();
                tmpArray.push("obj");
                for (var j = 0; j < i; j++) {
                    tmpArray.push(array[j]);
                };
                var evalString = tmpArray.join(".");
                if(!eval(evalString)){
                    eval(evalString+"={};");
                }
            };

            eval("obj."+attributeName+"='"+attributeValue+"';");

        };

        var properties = serializedParams.split("&");
        for (var i = 0; i < properties.length; i++) {
            evalThem(properties[i]);
        };
        if(options.prefix!=''){
            var newObj={};
            $.each(obj,function(index,value){
                newObj[options.prefix+index]=value
            });
            return newObj;
        }
        return obj;
    }
    $.fn.form2json = function(options){
        var serializedParams = this.serialize().replace(/\+/g," ").replace(/%0D%0A/g,"<br>");
        serializedParams=decodeURIComponent(serializedParams);
        var opts= $.extend({},$.fn.form2json.defaults,options)
        var obj = paramString2obj(serializedParams,opts);
        return obj;
        //return JSON.stringify(obj);
    }
    $.fn.form2json.defaults={
        prefix:""
    }
})(jQuery);