// для ускорения компиляции скриптов необходимо поисправлять все ошибки, которые находит jshint (показывает в консоли при работе gulp)
// или временно отключить jshint в тех тасках, которые используются в данный момент
// #todo давайте jshint и debug включать когда что-то разрабатываем, а в репо скидывать отключая их

var gulp = require('gulp'),
    less = require('gulp-less'),
	// importCss = require('gulp-import-css');
    cssmin = require('gulp-cssmin'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    // concat = require('gulp-concat'),
    minifyJs = require('gulp-uglify'),
    // cleanCSS = require('gulp-clean-css'),
    // plumber = require('gulp-plumber'),
    // debug = require('gulp-debug'),
    // jshint = require('gulp-jshint'),
    // sourcemaps = require('gulp-sourcemaps'),
    strip = require('gulp-strip-comments'),
	rigger = require('gulp-rigger'),
	// argv = require('yargs').argv, // получение переменных
	gutil = require('gulp-util')
	// spritesmith = require('gulp.spritesmith'),
	// isDebag = argv.debag ? true : false	// определение дебага
	//whichEnvironment = argv.envir // аргумент для компиляции для трето (если надо компилить для трето, то запускаем с--envir tr (например gulp default --envir tr))
	;

	var onError = function (err) {
	    gutil.log(gutil.colors.red('ERROR', 'less'), err);
	    this.emit('end', new gutil.PluginError('less', err, { showStack: true }));
	};

// запуск gulp less
gulp.task('less', function () {
	var lessArray; // массив с less файлами
	var gulpDest; // куда сохрянять итоговые файлы

	gulpDest = 'css/';
	lessArray = [ 

    'less/simple-list-drop.less', //стили для новой админки
	
	];
    return gulp.src(lessArray)
		// .pipe(sourcemaps.init()) // инициализируем sourcemap/
		.pipe(less({compress: true}).on('error', onError))
		// .pipe(sourcemaps.write()) // пропишем карты
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(gulpDest));
});

// очистка папок
// запуск gulp clean
gulp.task('clean', function () {
	var cleanTask; // массив с путями папок для очистки
	cleanTask = ['css/*'];

    return gulp.src(cleanTask)
        .pipe(clean());
});


// запустить все основные таски
// запуск gulp default
gulp.task('default', ['clean'], function () {
	var defaultTasksArray = [];

    defaultTasksArray = [
		'less'
	];

    defaultTasksArray.forEach(function (val) {
        gulp.start(val);
    });
});

// следить за изменениями во всех файлах less и в скриптах 
// gulp watch
gulp.task('watch', function () {
	var lessPaths; // пути для стилей
	lessPaths = [
					'less/*.less'
				];

    var less = gulp.watch(lessPaths, ['less']);
});