/**
 * @desc M版后台请求URL配置
 *
 * @created 2015.4.21
 * @update 2015.4.21
 */

define( 'config', function ($config) {
    return _.extend({
        /**
         * M版首页URL配置
         */

        INDEX: {
             // 电影列表
            GET_MOVIES: "https://api.douban.com/v2/movie/search", 
            GET_MOVIEINFO: "https://api.douban.com/v2/movie/subject/", 
            GET_REVIEWS: "https://api.douban.com/v2/movie/subject/:id/reviews", 
            GET_PHOTOS: "https://api.douban.com/v2/movie/subject/:id/photos",

            // 图书 https://api.douban.com/v2/book/search?tag=%E7%A7%91%E6%8A%80
            GET_BOOKS: "https://api.douban.com/v2/book/search", 
            GET_BOOKINFO: "https://api.douban.com/v2/book/", 

            // 活动

        }
    }, $config);
});