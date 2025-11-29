const gulp = require('gulp');
const plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass')(require('sass'));
const wait = require('gulp-wait');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const replace = require('gulp-replace');

// Generate timestamp for cache busting
function getTimestamp() {
    return Math.floor(Date.now() / 1000);
}

function scripts() {
    return gulp.src('./js/scripts.js')
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(babel({
            presets: [['@babel/env', {modules:false}]]
        }))
        .pipe(uglify({
            output: {
                comments: '/^!/'
            }
        }))
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest('./js'));
}

function styles() {
    return gulp.src('./scss/styles.scss')
        .pipe(wait(250))
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest('./css'));
}

function cacheBust() {
    const timestamp = getTimestamp();
    const versionPattern = /\?v=[\d\.]+/g;
    const newVersion = `?v=${timestamp}`;
    
    return gulp.src(['./index.html', './projects/*.html'])
        .pipe(replace(versionPattern, newVersion))
        .pipe(gulp.dest(function(file) {
            return file.base;
        }));
}

const build = gulp.series(styles, scripts, cacheBust);

function watch() {
    gulp.watch('./js/scripts.js', scripts);
    gulp.watch('./scss/styles.scss', gulp.series(styles, cacheBust));
}

exports.scripts = scripts;
exports.styles = styles;
exports.cacheBust = cacheBust;
exports.build = build;
exports.watch = watch;
exports.default = build;