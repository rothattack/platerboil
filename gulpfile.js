


// define our task dependencies
var gulp = require('gulp'),                             // g-god, main gulp
    // CSS & SASS tasks
    sass = require('gulp-sass'),                        // sass compiler
    autoPrefixer = require('gulp-autoprefixer'),        // adds browser prefixes to css rules
    minifyCss = require('gulp-minify-css'),             // minify css files
    // JS tasks
    uglify = require('gulp-uglify'),                    // uglifies js files
    jshint = require('gulp-jshint'),                    // validate js files
    concat = require('gulp-concat'),                    // concatinate js files
    // File structure tasks
    rename = require('gulp-rename'),                    // for renaming files
    sourcemaps = require('gulp-sourcemaps'),
    // Gulp & Misc. tasks
    svgmin = require('gulp-svgmin'),                    // well, minify svg files.
    notify = require('gulp-notify'),                    // osx only: pops a notification
    plumber = require('gulp-plumber'),                  // proceeds with other task on error
    stylish = require('jshint-stylish'),                // make errors readable in shell
    browserSync = require('browser-sync');              // launch a server and refresh page on change

// layout our file and directory sources and destinations
var source = {
    sass : 'source/scss/**/*.scss',                     // all sass files
    jsLint : [                                          // all js that should be linted
        'source/js/build/custom.js'
    ],
    jsUglify : [                                        // all js files that should not be concatinated
        'source/components/modernizr/modernizr.js'
    ],
    jsConcat : [                                        // all js files that should be concatinated
        'source/components/jquery/dist/jquery.min.js',
        'source/js/main.js'
    },
    svg : [
        'source/img/**/*.svg'
    ]
};

var dest = {
    css : 'source/css',                                 // destination of compiled css files
    js : 'source/js/build',                             // destination of compiled js files
    build : 'build'                                     // destination of production ready app
};


/*******************************************************************************
    SASS TASK
*******************************************************************************/

gulp.task('sass', function() {
    gulp.src(source.sass)                               // define the source file(s)
        .pipe(plumber())                                // keep gulp running on errors
        .pipe(sass())                                   // compile all sass files
        .pipe(autoPrefixer(                             // correct css vendor prefixes
            'last 2 version',
            '> 1%',
            'ie 8',
            'ie 9',
            'ios 6',
            'android 4'
        ))
        .pipe(minifyCss())                              // minify css code
        .pipe(gulp.dest(dest.css))                      // css files destination
        .pipe(notify({                                  // notify when done
            message: 'SCSS: Compilation complete!'
        }));
});


/*******************************************************************************
    JS TASKS
*******************************************************************************/

// lint my custom js
gulp.task('js-lint', function() {
    gulp.src(source.jsLint)                             // define the source file(s)
        .pipe(jshint())                                 // lint the files
        .pipe(jshint.reporter(stylish))                 // present the results in a beautiful way
});

// minify all js files that should not be concatinated
gulp.task('js-uglify', function() {
    gulp.src(source.jsUglify)                           // define the source file(s)
        .pipe(sourcemaps.init())
        .pipe(uglify())                                 // uglify the files
        .pipe(rename(function( path ){            // give the files a min suffix
            // path.dirname += '/someDirectory'
            path.basename += '.min';
            path.extname = '.js';
        }))
        .pipe(sourcemaps.write('vendors'))
        .pipe(gulp.dest(dest.js))                       // where to put the files
        .pipe(notify({ message: 'JS processed!'}));     // notify when done
});

// minify & concatinate all other js
gulp.task('js-concat', function() {
    gulp.src(source.jsConcat)                           // define the source file(s)
        .pipe(uglify())                                 // uglify the files
        .pipe(concat('scripts.min.js'))                 // concatinate to one file
        .pipe(gulp.dest(dest.js))                       // where to put the files
        .pipe(notify({message: 'JS processed!'}));      // notify when done
});


/*******************************************************************************
    SVG MINIFICATION
*******************************************************************************/

gulp.task('svg', function() {
    return gulp.src('assets/img/build/*.svg')
        .pipe(svgmin())
        .pipe(gulp.dest('assets/img'));
});


/*******************************************************************************
    BROWSER SYNC
*******************************************************************************/

gulp.task('browser-sync', function() {
    browserSync.init(['source/css/*.css', 'source/js/*.js', 'source/**/*.html'], {        // files to inject
        server: {
            baseDir: './source'
        }
    });
});


/*******************************************************************************
    GULP TASKS
*******************************************************************************/

gulp.task('default', ['sass', 'js-lint', 'js-uglify', 'js-concat', 'browser-sync'], function() {
    gulp.watch( source.sass, ['sass']);
    gulp.watch( source.jsLint, ['js-lint']);
    gulp.watch( source.jsUglify, ['js-uglify']);
    gulp.watch( source.jsConcat, ['js-concat']);
    gulp.watch( source.svg, ['svg']);
});