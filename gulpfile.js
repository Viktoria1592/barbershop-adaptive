var gulp = require('gulp');
var sass = require('gulp-sass');
var cssnano = require('gulp-cssnano');
var browserSync = require('browser-sync');
var rename = require('gulp-rename');
var bulkSass = require('gulp-sass-bulk-import');
var imagemin = require('gulp-imagemin');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var del = require('del');
var run = require('run-sequence');
var rigger = require('gulp-rigger');
var mqpacker = require('css-mqpacker');
var postcss = require("gulp-postcss");
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var cache = require('gulp-cache');
var spritesmith = require('gulp.spritesmith');
var ghpages = require('gulp-gh-pages');
var stylelint = require('stylelint');
var plumber = require('gulp-plumber');

gulp.task('html', function() {
  gulp.src('app/*.html') //Выберем файлы по нужному пути
    .pipe(rigger()) //Прогоним через rigger
    .pipe(gulp.dest('build')) //Выгружаем результат в папку build
    .pipe(browserSync.reload({
      stream: true
    })) //И перезагрузим наш сервер для обновлений
});


gulp.task('sass', function() { // Создаем таск "sass"
  return gulp.src('app/sass/**/*.scss') // Берем источник
    .pipe(bulkSass())
    .pipe(sass().on('error', sass.logError)) // Преобразуем Sass в CSS посредством gulp-sass
    .pipe(postcss([
      require('autoprefixer')
    ]))
    .pipe(cssnano()) // Сжимаем
    .pipe(rename({
      suffix: '.min'
    })) // Добавляем суффикс .min
    .pipe(gulp.dest('build/css')) // Выгружаем результата в папку build/css
    .pipe(browserSync.reload({
      stream: true
    })) // Обновляем CSS на странице при изменении
});


gulp.task('image', function () {
    return gulp.src(['app/img/**/*', '!app/img/sprite/**/*', '!app/img/sprite' ])
        .pipe(imagemin([
    imagemin.gifsicle({
            interlaced: true
        })
    ,
        imagemin.jpegtran({
            progressive: true
        })
    ,
        imagemin.optipng({
            optimizationLevel: 3
        })
        ,
        imagemin.svgo({
            plugins: [
                {removeViewBox: false}
            ]
        })
]))
        .pipe(gulp.dest('build/img'))
        .pipe(browserSync.reload({
        stream: true
    }))
});


gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('build/fonts'))
});


gulp.task('scripts', function() {
  return gulp.src(['app/js/**/*', '!app/js/libs/**/*', '!app/js/libs']) //при необходимости указываем нужные файлы библиотек
    .pipe(plumber())
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build/js'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('libs', function() {
  return gulp.src('app/js/libs/**/*')
    .pipe(uglify())
     .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('build/js/libs'))
    .pipe(browserSync.reload({
      stream: true
    }))
});


gulp.task('symbols', function () {
    return gulp.src('app/icons/*.svg')
       .pipe(imagemin([
      imagemin.svgo({
        plugins: [
          { optimizationLevel: 3 },
          { progessive: true },
          { interlaced: true },
          { removeViewBox: false },
//          { removeUselessStrokeAndFill: true },
          { cleanupIDs: false },
          { cleanupAttrs: true },
          { removeMetadata: true },
          { removeTitle: true },
//          { removeAttrs: { attrs: '(fill|stroke|data-name)' } },
        ],
      }),
    ]))
        .pipe(svgstore({inlineSvg: true}))
    .pipe(rename('svg-sprite.svg'))
    .pipe(gulp.dest('build/img'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('sprite', function () {
  var spriteData = gulp.src('app/img/sprite/*')
  .pipe(spritesmith({
    imgName: 'png-sprite.png',
    cssName: 'png-sprite.css',
      algorithm: 'binary-tree',
      padding: 2
  }));
  spriteData.img.pipe(gulp.dest('build/img'));
    spriteData.css.pipe(gulp.dest('build/css'));
});

gulp.task('ghpages', function ()  {
  gulp.src('build/**/*')
    .pipe(ghpages([{options : Object}]))
});


gulp.task('lint', function () {
  gulp.src('app/sass/**/*.scss')
    .pipe(postcss([
      stylelint(),
      require('postcss-reporter')({
        clearAllMessages: true,
      }),
    ], { syntax: require('postcss-scss') }))
});



gulp.task('clean', function() {
  return del('build/**/*')
});


gulp.task('build', function(fn) {
  run('clean', 'html', 'sass', 'scripts', 'libs', 'symbols', 'sprite', 'fonts', 'image', fn)
});

gulp.task('deploy', function ()  {
  run('build', 'ghpages')
    });


gulp.task('browser-sync', function() { // Создаем таск browser-sync
  browserSync({ // Выполняем browser Sync
    server: { // Определяем параметры сервера
      baseDir: 'build' // Директория для сервера - build
    },
    notify: false // Отключаем уведомления
  });
});


gulp.task('watch', ['browser-sync'], function() {
  gulp.watch('app/sass/**/*.scss', ['sass']); // Наблюдение за sass файлами в папке sass
  gulp.watch('app/**/*.html', ['html']); // Наблюдение за HTML файлами в корне проекта
  gulp.watch('app/js/*.js', ['scripts']); // Наблюдение за JS файлами в папке js
gulp.watch('app/js/libs/**/*', ['libs']);
  gulp.watch('app/img/**/*', ['image']);
  gulp.watch('app/icons/**/*', ['symbols'])
});


gulp.task('default', function() {
  run('build', ['watch'])
});
