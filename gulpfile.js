// define our task dependencies
const gulp = require('gulp'),                             // g-god, main gulp
    // JS tasks
    uglify = require('gulp-uglify'),                    // uglifies js files
    jshint = require('gulp-jshint'),                    // validate js files
    concat = require('gulp-concat'),                    // concatinate js files
    inject = require('gulp-inject'),                    // inject JS and CSS unto html
    angularFilesort = require('gulp-angular-filesort'), // Angular file sorter
    // File structure tasks
    rename = require('gulp-rename'),                    // for renaming files
    sourcemaps = require('gulp-sourcemaps'),
    // Gulp & Misc. tasks
    svgmin = require('gulp-svgmin'),                    // well, minify svg files.
    notify = require('gulp-notify'),                    // osx only: pops a notification
    plumber = require('gulp-plumber'),                  // proceeds with other task on error
    del     = require('del'),                           // delete files and/or directories
    stylish = require('jshint-stylish'),                // make errors readable in shell
    browserSync = require('browser-sync');              // launch a server and refresh page on change
    minifyCss = require('gulp-minify-css');             // minify css files


// layout our file and directory sources and destinations
var source = {
    sass : './source/scss/**/*.scss',                   // all sass files
    jsLint : ['source/js/build/custom.js'],
    jsUglify : [                                        // all js files that should not be concatinated
        ''
    ],
    jsConcat : [                                        // all js files that should be concatinated
        'source/components/jquery/dist/jquery.min.js',
        'source/js/main.js'
    ],
    svg : [
        'source/img/**/*.svg'
    ]
};

var dest = {
    css : 'source/styles',                                 // destination of compiled css files
    js : 'source/scripts',                             // destination of compiled js files
    build : 'build'                                     // destination of production ready app
};


/*******************************************************************************
    GULP DEVELOPMENT TASKS
*******************************************************************************/

/*******************************************************************************
    SASS TASK
*******************************************************************************/

require('./gulp/tasks/sass')(); // task "sass"
require('./gulp/tasks/styles')(['sass']); // task "styles"


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
    gulp.src('./build/scripts/**/*.js')                 // define the source file(s)
        .pipe(sourcemaps.init())
        .pipe(uglify())                                 // uglify the files
        // .pipe(rename(function( path ){                  // give the files a min suffix
        //     // path.dirname += '/someDirectory'
        //     path.basename += '.min';
        //     path.extname = '.js';
        // }))
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

gulp.task('js:dev', () => {
    var target = gulp.src('./source/index.html'),
        source = gulp.src('./source/scripts/**/*.js', { read: false }),
        dest   = gulp.dest('./source');

    return target.pipe(inject(source, {
            starttag: '<!-- inject:body:{{ext}} -->',
            relative: true
        }))
        .pipe(dest);
})


/*******************************************************************************
    SVG MINIFICATION
*******************************************************************************/

gulp.task('svg', function() {
    return gulp.src('assets/img/build/*.svg')
        .pipe(svgmin())
        .pipe(gulp.dest('assets/img'));
});


/*******************************************************************************
    BUILD OUR DEPENDENCY LIBRARY
*******************************************************************************/
// Copy the build files for our dependencies from node_modules.
// Just add the path to any dependency you may add in the future
// within the "dependencies" array variable.
gulp.task('copy:lib', () => {
    var dependencies = [
        // './node_modules/jquery/dist/jquery.js',
        './node_modules/angular/angular.js',
        './node_modules/angular-ui-router/release/angular-ui-router.js'
    ]
    // clean lib folder and then copy dependencies
    del('./source/lib', ( err ) => {
        return gulp.src(dependencies)
            .pipe(angularFilesort())
            .pipe(gulp.dest('./source/lib'))
    })
});
// This will inject any javascript dependencies within the <head>
// of our index.html file.
gulp.task('inject:head:js', ['copy:lib'], () => {
    var target = gulp.src('./source/index.html'),
        coreAngular = gulp.src('./source/lib/angular.js', { read: false })
        source = gulp.src(['./source/lib/**/*.js', '!./source/lib/angular.js'], { read: false }),
        dest   = gulp.dest('./source');

    return target
        .pipe(inject(coreAngular, { starttag: '<!-- inject:angular:{{ext}} -->', relative: true }))
        .pipe(inject(source, { starttag: '<!-- inject:head:{{ext}} -->', relative: true }))
        .pipe(dest);
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

gulp.task('default', ['styles', 'js-lint', 'js-concat', 'inject:head:js', 'browser-sync'], function() {
    gulp.watch('./source/scss/**/*.scss', ['styles']);
    gulp.watch('./source/scripts/**/*.js', ['js-lint']);
    gulp.watch( source.jsUglify, ['js-uglify']);
    gulp.watch( source.jsConcat, ['js-concat']);
    gulp.watch( source.svg, ['svg']);
});



/*******************************************************************************
    GULP PRODUCTION TASKS
*******************************************************************************/

// Copy files in ./source root
gulp.task('build:copy', () => {
    return gulp.src('./source/*.*')
        .pipe(gulp.dest('./.tmp'))
})

// Build our JS scripts
gulp.task('build:scripts', () => {
    return gulp.src('./source/scripts/**/*.js')
        .pipe(angularFilesort())
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./.tmp/scripts'))
})

// Build our CSS styles
gulp.task('build:styles', ['styles'], () => {
    return gulp.src('./source/styles/**/*.css')
        .pipe(minifyCss())
        .pipe(gulp.dest('./.tmp/styles'))
})

// Build our production application
gulp.task('build', ['build:copy', 'build:scripts', 'build:styles'], () => {
    var cleanBuild = new Promise(( resolve, reject ) => {
        del('./build', () => {
            return gulp.src('./.tmp/**/*')
                .pipe(gulp.dest('./build'))
                .on('end', resolve)
        })
    });

    cleanBuild.then( () => {
        return del('./.tmp', () => {
            console.log('BUILD: C O M P L E T E!')
        })
    })
})