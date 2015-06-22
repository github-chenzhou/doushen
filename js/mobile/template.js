/**
 * @desc M版模板库
 *
 * @created 2015.4.21
 * @update 2015.4.27
 */

define( 'template', ['config'], function ($config) {
    return {

        INDEX_HEAD_TPL: [
            '<div class="top_user_info">',
            '<a href="#index/space/{{data.userId}}">',
                '<img src="{{data.userId}}.jpg" />',
            '<span class="user_name">{{data.userName}}</span>',
            '</a></div>',
            '<a href="javascript:;" class="publish_btn"><span class="icon-edit"></span></a>'
        ].join(),





        /*------------------------------*\
            电影
        \*------------------------------*/


        // 首页列表
        INDEX_MOVIE_TPL: [
            '{@each list as item}',

            '<div class="feed_box">',

            '{# 基本信息}',
            '<header class="feed_header clearfix">',

            '{@if item.rating }',
            '<span class="fr star"><span class="star50"></span>{{item.rating.average}}</span>',
            '{@/if}',

            '<dl class="user_info">',
            '<dd class="user_related">',
            '<a href="#{{viewName}}/{{item.id}}" class="user_name cont_title ">{{item.title}}</a>',
    
            '{# 类型}',
            '<p class="meta color8">',
            '{@each item.genres as genre}',
            '<span class="">{{genre}}</span>',
            '{@/each}',
            '</p>',

            '{# 导演 主演}',
            '<p class="meta color8">',
            '{@each item.actors as actor}',
            '<a href="javascript:;" class="">{{actor}}</a>',
            '{@/each}',
            '</p>',

            '</dd></dl></header>',

            '<a href="#{{viewName}}/{{item.id}}">',

            '{# 内容}',
            '<section class="feed_cont">',
            '{# 图片列表}',
            '<div class="feed_pic"><ul class="feed_pic_list" data-imgs="{{item.imgs}}">',
            '{@each item.imgs as img, index}',
            '{@if index < 4 }',
            '<li><span class="pic_wrap">',
            '<img src="{{img}}"/>',
            '<i class="valign"></i></span></li>',
            '{@/if}',
            '{@/each}',
            '</ul></div>',

            '</section>',
            '</a>',

            '{# 赞、评论}',
            '<footer class="gray_bar flex_equal">',
            '<a href="javascript:;" class="flex_item"><i class="iconfont icon-heart"></i><span class="color8 text_sub">{{item.collect_count}}</span></a>',
            '<span class="line_gradient"></span>',
            '<a href="javascript:;" class="flex_item"><i class="iconfont icon-star"></i><span class="color8 text_sub">{{item.rating.stars}}</span></a>',
            '</footer>',

            '</div>',

            '{@/each}'
        ].join(''),
    
        /**
         * 详情页: 电影
         * TODO: 1、内容 剧情 剧照  2、演员  3、电评
         * update: 2015.05.4
         */
        INFO_MOVIE_TPL: [
            '<nav class="top_navgination clearfix">',
            '<a href="javascript:;" class="fl back J_movie_back"><i class="arror_left"></i></a>',
            '<h1 class="top_title txt_cut">电影介绍</h1>',
            '</nav>',

            '{# 具体内容}',
            '<div class="artical_cont mb60">',

            '{# 标题区}',
            '<header class="info_title information_title clearfix">',
            '<h2><a href="{{data.mobile_url}}">{{data.title}}</a></h2>',
            '<span class="fr star"><span class="star50"></span>{{data.rating.average}}</span>',
            '</header>',

            '{# 剧情}',
            '<article class="info_detail">{{{data.summary}}}',

            '{# 剧照}',
            '{@if data.images }',
            '<ul class="talk_imgs">',
            '<li><img src="{{data.images["large"]}}" /></li>',
            '{@each data.imgs as img}',
            '<li><img src="{{img}}" /></li>',
            '{@/each}',
            '</ul>',
            '{@/if}',

            '</article>',


            '{# 数据统计 }',
            '<section class="gray_bar cont_footer clearfix">',
            '<div class="fl count_num">评论 {{data.comments_count}}</div>',
            '<div class="fr flex_equal bar_opt">',
            '<a href="#" class="flex_item"><i class="iconfont icon-heart"></i><span class="color8">{{data.reviews_count}}</span></a>',
            '<span class="line_gradient"></span>',
            '<a href="#" class="flex_item"><i class="iconfont icon-reproduce"></i><span class="color8">{{data.wish_count}}</span></a>',
            '<span class="line_gradient"></span>',
            '<a href="#" class="flex_item"><i class="iconfont icon-star"></i><span class="color8">{{data.ratings_count}}</span></a>',
            '</div>',
            '</section>',


             '{# 导演 演员 展示区}',
            '<section class="message_wrap J_actors"></section>',

            '{# 评论列表区}',
            '<section class="comment_list J_movie_comments">',
            '</section>',

            // '<a href="javascript:;" class="showMore J_movie_commons_more">获取更多评论</a>',

            '</div>'

        ].join(''),

         // 
        MOVIE_ACTOR_TPL: [
            '{@each list as data}',

            '<div class="avatar_box msg_item clearfix">',
            '<div class="fl avatar">',
            '<div class="color_block blue_bg pink_bg">',
            '{@if data.avatars["small"] }',
            '<a href="{{data.alt}}"><img src="{{data.avatars["small"]}}"/></a>',
            '{@/if}',
            '</div>',
            '</div>',
            '<div class="content">',
            '<div class="msg_info clearfix">{{data.role}}<span class="fr gray_txt"></span></div>',
            '<div class="msg_type title_txt">{{data.name}}</div>',
            '</div>',
            '</div>',
            '{@/each}'
        ].join(''),

        // 详情评论
        INFO_COMMENTS_TPL: [
            '{@each list as it}',

            '<div class="comment_item">',
            '<header class="avatar_box clearfix">',
            '<div class="fl avatar">',
            '<a href="#">',
                '<img src="{{it.comment.userId}}.jpg" onerror="javascript:this.src=\'/images/app/honeybee/demoimg/default1.gif\'"/>',
            '</a>',
            '</div>',
            '<div class="content">',
            '<div class="related_info">',
            '<a href="#" class="fr gray_txt">回复</a>',
            '<span class="title_txt">{{it.comment.userName}}</span>',
            '</div>',
            '<span class="gray_txt">{{it.comment.createDate}}</span>',
            '</div>',
            '</header>',
            '<article class="coment_cont">{{it.comment.content}}</article>',
            '</div>',

            '{@/each}'
        ].join(''),

        // 图片详情
        INFO_PICS_TPL: [
            '<nav class="top_navgination info_pics_header clearfix">',
            '<a href="javascript:;" class="fl back J_info_back"><i class="arror_left"></i></a>',
            '<a href="javascript:;" class="fr publish J_pic_comments">{{data.commentCount}}条评论</a>',
            '<h1 class="top_title txt_cut J_pics_title">图片浏览</h1>',
            '</nav>',

            '{# 图片浏览区 }',
            '<section class="info_pics J_pics_wrapper"></section>',

            '<footer class="info_pics_footer">',
            '<div class="info_pics_summary J_pic_summary"></div>',
            '{# 统计数据 }',
            '<div class="gray_bar info_pics_stistic flex_equal J_pic_footer">',
            '<a href="javascript:;" class="flex_item"><i class="iconfont icon-heart"></i><span class="color8">{{data.diggCount}}</span></a>',
            '<span class="line_gradient"></span>',
            '<a href="javascript:;" class="flex_item"><i class="iconfont icon-reproduce"></i><span class="color8">{{data.transferCount}}</span></a>',
            '<span class="line_gradient"></span>',
            '<a href="javascript:;" class="flex_item"><i class="iconfont icon-star"></i><span class="color8">{{data.collectCount}}</span></a>',
            '</div></footer>'

        ].join(''),

        INFO_PICS_FOOTER_TPL: [
            '{# 统计数据 }',
            '<a href="javascript:;" class="flex_item"><i class="iconfont icon-heart"></i><span class="color8">{{data.diggCount}}</span></a>',
            '<span class="line_gradient"></span>',
            '<a href="javascript:;" class="flex_item"><i class="iconfont icon-reproduce"></i><span class="color8">{{data.transferCount}}</span></a>',
            '<span class="line_gradient"></span>',
            '<a href="javascript:;" class="flex_item"><i class="iconfont icon-star"></i><span class="color8">{{data.collectCount}}</span></a>'
        ].join(''),





        /*------------------------------*\
            图书
        \*------------------------------*/


        // 图书列表
        BOOKS_TPL: [
            '<li class="book_box">',
            '<a href="#books/{{data.id}}">',

            '<span class="pic_wrap">',
            '<img src="{{data.images["large"]}}"/>',
            '<i class="valign"></i></span>',
            '<p class="title">{{data.title}}</p>',
            '</a>',

            '</li>'
        ].join(''),


         /**
         * 详情页: 图书
         * TODO: 1、内容 剧情 剧照  2、演员  3、电评
         * update: 2015.05.4
         */
        INFO_BOOK_TPL: [
            '<nav class="top_navgination clearfix">',
            '<a href="javascript:;" class="fl back J_book_back"><i class="arror_left"></i></a>',
            '<h1 class="top_title txt_cut">图书介绍</h1>',
            '</nav>',

            '{# 具体内容}',
            '<div class="artical_cont mb60">',

            '{# 标题区}',
            '<header class="info_title information_title clearfix">',
            '<h2><a href="{{data.alt}}">{{data.title}}</a></h2>',
            '<span class="fr star"><span class="star50"></span>{{data.rating.average}}</span>',
            '</header>',

            '{# 剧情}',
            '<article class="info_detail">{{{data.summary}}}',

            '{# 剧照}',
            '{@if data.images }',
            '<ul class="talk_imgs">',
            '<li><img src="{{data.images["large"]}}" /></li>',
            '</ul>',
            '{@/if}',

            '</article>',

            '{# 目录结构 }',
            '<article class="info_detail">{{data.catalog}}</article>',

            '{# 作者}',
            '<article class="info_detail">{{data.author_intro}}</article>',

            '</div>'

        ].join('')
    
    
    }
});
