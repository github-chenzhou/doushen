// Generated on 2015-02-03 using
// generator-webapp 0.5.1
'use strict';

// # Globbing

module.exports = function (grunt) {

  // Configurable paths
  var config = {
    app: '.',
    dist: '.'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    config: config,

    clean: {
      build: {
        src: ['<%= config.test %>/', '<%= config.dist %>/']
      }
    },

    // 脚本验证
    jshint: {
      options: {
        //jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= config.app %>/js/mobile/{,*/}*.js'
      ]
    },

    // Compiles Sass to CSS and generates necessary files if requested
    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: [{
          expand: true,
          cwd: '<%= config.app %>/sass/',
          src: ['*.{scss,sass}'],
          dest: '<%= config.app %>/css/',
          ext: '.css'
          }
          /*
          files: {                       // 文件列表
          'main.css': 'main.scss',       // '目标文件': '源文件'
          'widgets.css': 'widgets.scss'
          }
          */
        ]
      }
    },

     // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/css/',
          src: '{,*/}*.css',
          dest: '<%= config.test %>/css/'
        }]
      }
    },

    // 文件合并 样式文件和脚本文件
    concat: {
      index: {
        src: [
              '<%= config.app%>/js/mobile/common/ajax.js', 
              '<%= config.app%>/js/mobile/common/util.js', 
              '<%= config.app%>/js/mobile/common/feedback.js', 
              '<%= config.app%>/js/mobile/common/tip_box.js',  
              '<%= config.app%>/js/mobile/url_config.js', 
              '<%= config.app%>/js/mobile/template.js', 
              '<%= config.app%>/js/mobile/router.js', 
              '<%= config.app%>/js/mobile/movies/pictureActions.js',
              '<%= config.app%>/js/mobile/movies/info.js', 
              '<%= config.app%>/js/mobile/movies/movies.js', 
              '<%= config.app%>/js/mobile/onlines/onlines.js',
              // '<%= config.app%>/js/mobile/onlines/info.js',  
              '<%= config.app%>/js/mobile/books/books.js',
              '<%= config.app%>/js/mobile/books/info.js', 
              '<%= config.app%>/js/mobile/index.js'
              ],
        dest: '<%= config.dist%>/js/mobile/m.js'
      },
      plugins: {
        src: [
              '<%= config.app%>/js/app/honeybee/common/pswutil.js',
              '<%= config.app%>/js/mobile/common/islider_core.js',
              '<%= config.app%>/js/mobile/common/vendor.js' 
            ],
        dest: '<%= config.dist%>/js/mobile/plugins.js'
      },
      lib: {
        src: ['<%= config.app%>/js/require.js','<%= config.app%>/js/underscore-min.js', 
              '<%= config.app%>/js/backbone-min.js', '<%= config.app%>/js/zepto.min.js' ],
        dest: '<%= config.test%>/requirezeptobackbone.js'
      },

      css: {
        src:[
          //'<%= config.app%>/css/webfont/style.css', 
          '<%= config.app%>/css/mobile/reset.css', 
          '<%= config.app%>/css/mobile/common.css', 
          '<%= config.app%>/css/mobile/islider.css', 
          '<%= config.app%>/css/mobile/index.css'],
        dest: '<%= config.dist%>/css/mobile/index.min.css'
      }
    },
    
    //文件压缩
    cssmin: { 
      minify: { 
        expand: true, 
        cwd: '<%= config.app%>/css/mobile/',
        src: ['index.min.css'], 
        dest: '<%= config.app%>/css/mobile/'
        //ext: '.css' 
      }, 
      combine: { 
        files: { '': [] } 
      }
    },

    uglify: {
      options: {
        banner: '/*! 中教启星M版 <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        mangle: false, //不混淆变量名
        //preserveComments: 'all', //不删除注释，还可以为 false（删除全部注释），some（保留@preserve @license @cc_on等注释）
        sourceMapRoot: '<%= config.dist%>/js/mobile/'
        //sourceMap: '*.min.js.map'
        //sourceMapUrl: 
      },
      target: {
        expand: true,
        cwd: '<%= config.dist%>/js/mobile/',
        src: 'm.js',
        dest: '<%= config.dist%>/js/mobile/',
        ext: '.min.js'
      }
    },


    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.test %>/',
          dest: '<%= config.dist %>/',
          src: [
            '*.{ico,png,txt}',
            'images/{,*/}*.*',
            '{,*/}*.html',
            'css{,*/}*.*',
            'js{,*/}*.*'
          ]
        }, {
          expand: true,
          dot: true,
          cwd: '<%= config.app %>/',
          src: ['images/{,*/}*.*', 'img/{,*/}*.*', '{,*/}*.html', 'css/fonts/{,*/}*.*'],
          dest: '<%= config.dist %>'
        }]
      },
      styles: {
        expand: true,
        dot: true,
        cwd: '<%= config.app %>/',
        dest: '<%= config.dist %>/',
        src: '{,*/}*.css'
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      options: {
        dest: '<%= config.dist %>'
      },
      html: '<%= config.app %>/index.html'
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      options: {
        assetsDirs: [
          '<%= config.dist %>',
          '<%= config.dist %>/images',
          '<%= config.dist %>/css'
        ]
      },
      html: ['<%= config.dist %>/{,*/}*.html'],
      css: ['<%= config.dist %>/css/{,*/}*.css']
    },
    
    htmlmin: {
      dist: {
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeAttributeQuotes: true,
          removeCommentsFromCDATA: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true,
          removeRedundantAttributes: true,
          useShortDoctype: true
        },
        files: [{
          expand: true,
          cwd: '<%= config.dist %>',
          src: '{,*/}*.html',
          dest: '<%= config.dist %>'
        }]
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/images',
          src: '{,*/}*.{gif,jpeg,jpg,png}',
          dest: '<%= config.dist %>/images'
        },{
          expand: true,
          cwd: '<%= config.app %>/img',
          src: '{,*/}*.{gif,jpeg,jpg,png}',
          dest: '<%= config.dist %>/img'
        }]
      }
    }

  });
    
  
  //grunt.loadNpmTasks('grunt-contrib-sass');    //sass
  grunt.loadNpmTasks('grunt-contrib-jshint');  //检查JavaScript语法
  grunt.loadNpmTasks('grunt-contrib-uglify');  //压缩以及合并JavaScript文件
  grunt.loadNpmTasks('grunt-contrib-concat');  //合并文件
  grunt.loadNpmTasks('grunt-contrib-cssmin');  //压缩以及合并CSS文件
  grunt.loadNpmTasks('grunt-contrib-copy');    //复制文件
  grunt.loadNpmTasks('grunt-contrib-clean');   //删除文件
  grunt.loadNpmTasks('grunt-contrib-imagemin');//图片压缩
  grunt.loadNpmTasks('grunt-contrib-htmlmin'); //HTML文件压缩
  grunt.loadNpmTasks('grunt-usemin');// 
  grunt.loadNpmTasks('grunt-autoprefixer');// 


  grunt.registerTask('check', [
    'jshint'
  ]);

  grunt.registerTask('build', [
    'clean',
    'useminPrepare',
    'sass',
    'concat',
    'autoprefixer',
    'cssmin',
    'uglify',
    'copy',
    'usemin',
    'htmlmin',
    'imagemin'
  ]);


  grunt.registerTask('buildm', [
    'concat',
    'cssmin',
    'uglify'
  ]);



};
