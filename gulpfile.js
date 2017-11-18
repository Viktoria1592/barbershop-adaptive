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
var changed = require('gulp-changed');
var validate = require('gulp-w3c-css');
var w3cValidation = require('gulp-w3c-html-validation');
var w3cjs = require('gulp-w3cjs');
var realFavicon = require ('gulp-real-favicon');
var fs = require('fs');
var through2 = require('through2');

gulp.task('html', function () {
    gulp.src('app/*.html') //Выберем файлы по нужному пути
        .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest('build')) //Выгружаем результат в папку build
        .pipe(browserSync.reload({
            stream: true
        })) //И перезагрузим наш сервер для обновлений
});
gulp.task('sass', function () { // Создаем таск "sass"
    return gulp.src('app/sass/**/*.scss') // Берем источник
        .pipe(bulkSass()).pipe(sass().on('error', sass.logError)) // Преобразуем Sass в CSS посредством gulp-sass
        .pipe(postcss([
      require('autoprefixer')
    ])).pipe(cssnano()) // Сжимаем
        .pipe(rename({
            suffix: '.min'
        })) // Добавляем суффикс .min
        .pipe(gulp.dest('build/css')) // Выгружаем результата в папку build/css
        .pipe(browserSync.reload({
            stream: true
        })) // Обновляем CSS на странице при изменении
});
gulp.task('image', function () {
    return gulp.src(['app/img/**/*', '!app/img/sprite/**/*', '!app/img/sprite']).pipe(imagemin([
    imagemin.gifsicle({
            interlaced: true
        })

        , imagemin.jpegtran({
            progressive: true
        })

        , imagemin.optipng({
            optimizationLevel: 3
        })

        , imagemin.svgo({
            plugins: [
                {
                    removeViewBox: false
        }
            ]
        })
])).pipe(gulp.dest('build/img')).pipe(browserSync.reload({
        stream: true
    }))
});
//gulp.task('fonts', function () {
//    return gulp.src('app/fonts/**/*').pipe(gulp.dest('build/fonts'))
//});
gulp.task('scripts', function () {
    return gulp.src(['app/js/**/*', '!app/js/libs/**/*', '!app/js/libs']) //при необходимости указываем нужные файлы библиотек
        .pipe(plumber()).pipe(concat('main.min.js')).pipe(uglify()).pipe(gulp.dest('build/js')).pipe(browserSync.reload({
            stream: true
        }))
});
gulp.task('libs', function () {
    return gulp.src('app/js/libs/**/*').pipe(uglify()).pipe(rename({
        suffix: '.min'
    })).pipe(gulp.dest('build/js/libs')).pipe(browserSync.reload({
        stream: true
    }))
});
gulp.task('symbols', function () {
    return gulp.src('app/icons/*.svg').pipe(imagemin([
      imagemin.svgo({
            plugins: [
                {
                    optimizationLevel: 3
        }
        , {
                    progessive: true
        }
        , {
                    interlaced: true
        }
        , {
                    removeViewBox: false
        }
, //          { removeUselessStrokeAndFill: true },
                {
                    cleanupIDs: false
        }
        , {
                    cleanupAttrs: true
        }
        , {
                    removeMetadata: true
        }
        , {
                    removeTitle: true
        }
, //          { removeAttrs: { attrs: '(fill|stroke|data-name)' } },
        ]
        , })
    , ])).pipe(svgstore({
        inlineSvg: true
    })).pipe(rename('svg-sprite.svg')).pipe(gulp.dest('build/img')).pipe(browserSync.reload({
        stream: true
    }))
});
gulp.task('sprite', function () {
    var spriteData = gulp.src('app/img/sprite/*').pipe(spritesmith({
        imgName: 'png-sprite.png'
        , cssName: 'png-sprite.css'
        , algorithm: 'binary-tree'
        , padding: 2
    }));
    spriteData.img.pipe(gulp.dest('build/img'));
    spriteData.css.pipe(gulp.dest('build/css'));
});
gulp.task('ghpages', function () {
    gulp.src('build/**/*').pipe(ghpages([{
        options: Object
  }]))
});
gulp.task('lint', function () {
    gulp.src('app/sass/**/*.scss').pipe(postcss([
      stylelint()
      , require('postcss-reporter')({
            clearAllMessages: true
        , })
    , ], {
        syntax: require('postcss-scss')
    }))
});
gulp.task('clean', function () {
    return del('build/**/*')
});
gulp.task('build', function (fn) {
    run('clean', 'html', 'sass', 'scripts', 'libs', 'symbols', 'sprite', 'image', 'copy', 'favicon-markups',  fn)
});
gulp.task('deploy', function () {
    run('build', 'ghpages')
});
gulp.task('copy', function () {
    gulp.src('app/static/**/*').pipe(changed('build')).pipe(gulp.dest('build/static'))
});
gulp.task('browser-sync', function () { // Создаем таск browser-sync
    browserSync({ // Выполняем browser Sync
        server: { // Определяем параметры сервера
            baseDir: 'build' // Директория для сервера - build
        }
        , notify: false // Отключаем уведомления
    });
});
gulp.task('watch', ['browser-sync'], function () {
    gulp.watch('app/sass/**/*.scss', ['sass']); // Наблюдение за sass файлами в папке sass
    gulp.watch('app/**/*.html', ['html']); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('app/js/*.js', ['scripts']); // Наблюдение за JS файлами в папке js
    gulp.watch('app/js/libs/**/*', ['libs']);
    gulp.watch('app/img/**/*', ['image']);
    gulp.watch('app/icons/**/*', ['symbols'])
});
gulp.task('default', function () {
    run('build', ['watch'])
});
gulp.task('css-val', function () {
    return gulp.src('build/css/**/*.css').pipe(validate()).pipe(gulp.dest('build/validation'))
});
gulp.task('html-val', function () {
    return gulp.src('build/*.html')
        .pipe(w3cValidation({
        generateCheckstyleReport: 'w3cErrors/validation.xml'
        ,
        remotePath: '/', // use regex validation for domain check 
    remoteFiles: 'build/validation-files.json'
    }))
});
gulp.task('js-val', function () {
    gulp.src('build/**/*.html')
        .pipe(w3cjs())
    .pipe(through2.obj(function(file, enc, cb){
			cb(null, file);
//			if (!file.w3cjs.success){
//				throw new Error('HTML validation error(s) found');
//			}
		}));
});


var FAVICON_DATA_FILE = 'faviconData.json';
gulp.task('favicon', function(done) {
	realFavicon.generateFavicon({
		masterPicture: 'favicon.svg',
		dest: 'app/static/favicons',
		iconsPath: 'build/static/favicons',
		design: {
			ios: {
				pictureAspect: 'backgroundAndMargin',
                backgroundColor: '#83b89e',
                margin: '14%',
				assets: {
					ios6AndPriorIcons: true,
					ios7AndLaterIcons: true,
					precomposedIcons: true,
					declareOnlyDefaultIcon: true
				}
			},
			desktopBrowser: {},
			windows: {
				pictureAspect: 'noChange',
				backgroundColor: '#da532c',
				onConflict: 'override',
				assets: {
					windows80Ie10Tile: true,
					windows10Ie11EdgeTiles: {
						small: true,
						medium: true,
						big: true,
						rectangle: true
					}
				}
			},
			androidChrome: {
				pictureAspect: 'noChange',
				themeColor: '#83b89e',
				manifest: {
					display: 'standalone',
					orientation: 'notSet',
					onConflict: 'override',
					declared: true
				},
				assets: {
					legacyIcon: false,
					lowResolutionIcons: true
				}
			},
            safariPinnedTab: {
				pictureAspect: 'silhouette',
				themeColor: '#89baa2'
			}
		},
		settings: {
			scalingAlgorithm: 'Mitchell',
			errorOnImageTooSmall: false
		},
		markupFile: FAVICON_DATA_FILE
	}, function() {
		done();
	});
});

gulp.task('favicon-markups', function() {
	return gulp.src([ 'build/*.html' ])
		.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
		.pipe(gulp.dest('build'));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('check-for-favicon-update', function(done) {
	var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	realFavicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		}
	});
});