/*******************************************************************************
    SASS TASK
*******************************************************************************/
var gulp = require('gulp'),
    notify = require('gulp-notify'),                    // osx only: pops a notification
    plumber = require('gulp-plumber'),                  // proceeds with other task on error
    sass = require('gulp-sass'),                        // sass compiler
    sourcemaps = require('gulp-sourcemaps'),
    autoPrefixer = require('gulp-autoprefixer')         // adds browser prefixes to css rules


 module.exports = function( dependencies ) {
    gulp.task('sass', dependencies, () => {
        return gulp.src('./source/scss/**/*.scss')          // define the source file(s)
            .pipe(plumber())                                // keep gulp running on errors
            .pipe(sourcemaps.init())
            .pipe(sass())                                   // compile all sass files
            .pipe(autoPrefixer(                             // correct css vendor prefixes
                'last 2 version',
                '> 1%',
                'ie 8',
                'ie 9',
                'ios 6',
                'android 4'
            ))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./source/styles'))             // css files destination
            .pipe(notify({                                  // notify when done
                message: 'SASS Task: CSS Compilation complete!'
            }));
    })
}