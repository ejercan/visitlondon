var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var autoprefixer = require('gulp-autoprefixer');
var browserify = require('gulp-browserify');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var merge = require('merge-stream');
var newer = require('gulp-newer');
var imagemin = require('gulp-imagemin');
var injectPartials = require('gulp-inject-partials');
var minify = require('gulp-minify');
var rename = require('gulp-rename');
var cssmin = require('gulp-cssmin');
var htmlmin = require('gulp-htmlmin');

var SOURCEPATH = {
    sassSource: 'src/scss/*.scss',
    sassApp: 'src/scss/app.scss',
    htmlSource: 'src/*.html',
    htmlPartialSource: 'src/partial/*.html',
    jsSource: 'src/js/**',
    imgSource: 'src/img/**'
};
var APPPATH = {
    root: 'app/',
    css: 'app/css',
    fonts: 'app/fonts',
    js: 'app/js',
    img: 'app/img'
};

gulp.task('clean-html', function() {
    return gulp.src(APPPATH.root + '/*.html', {read: false, force: true})
        .pipe(clean());
});

gulp.task('clean-scripts', function() {
    return gulp.src(APPPATH.js + '/*.js', {read: false, force: true})
        .pipe(clean());
});

gulp.task('sass', function() {
    var sassFiles;

    return sassFiles = gulp.src(SOURCEPATH.sassApp)
        .pipe(autoprefixer())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(concat('app.css'))
        .pipe(gulp.dest(APPPATH.css));
});

gulp.task('images', function() {
    return gulp.src(SOURCEPATH.imgSource)
        .pipe(newer(APPPATH.img))
        .pipe(imagemin())
        .pipe(gulp.dest(APPPATH.img));

});

gulp.task('scripts', ['clean-scripts'], function() {
   gulp.src(SOURCEPATH.jsSource)
       .pipe(concat('main.js'))
       .pipe(browserify())
       .pipe(gulp.dest(APPPATH.js));
});


/* Production Tasks */
gulp.task('compress', function() {
    gulp.src(SOURCEPATH.jsSource)
        .pipe(concat('main.js'))
        .pipe(browserify())
        .pipe(minify())
        .pipe(gulp.dest(APPPATH.js));
});

gulp.task('compresscss', function() {
    var sassFiles;

    return sassFiles = gulp.src(SOURCEPATH.sassSource)
        .pipe(autoprefixer())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(concat('app.css'))
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(APPPATH.css));
});

gulp.task('minifyHtml', function() {
    return gulp.src(SOURCEPATH.htmlSource)
        .pipe(injectPartials())
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(APPPATH.root))
});

/* End of Production Tasks */

gulp.task('html', function() {
    return gulp.src(SOURCEPATH.htmlSource)
        .pipe(injectPartials())
        .pipe(gulp.dest(APPPATH.root))
});

/*gulp.task('copy', ['clean-html'], function() {
    gulp.src(SOURCEPATH.htmlSource)
        .pipe(gulp.dest(APPPATH.root));
});*/

gulp.task('serve', ['sass'], function() {
   browserSync.init([APPPATH.css + '/*.css', APPPATH.root + '/*.html', APPPATH.js + '/*.js'], {
       server: {
           baseDir: APPPATH.root
       }
   })
});

gulp.task('watch', ['serve', 'sass', 'clean-html', 'clean-scripts', 'scripts', 'images', 'html'], function() {
    gulp.watch([SOURCEPATH.sassSource], ['sass']);
    // gulp.watch([SOURCEPATH.htmlSource], ['copy']);
    gulp.watch([SOURCEPATH.jsSource], ['scripts']);
    gulp.watch([SOURCEPATH.imgSource], ['images']);
    gulp.watch([SOURCEPATH.htmlSource, SOURCEPATH.htmlPartialSource], ['html']);
});

gulp.task('default', ['watch']);
gulp.task('production', ['minifyHtml', 'compresscss', 'compress']);