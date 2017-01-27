var gulp = require('gulp'),
	inject = require('gulp-inject'),
    notify = require('gulp-notify');                    // Pops a notification

module.exports = function ( dependencies ) {
    gulp.task('styles', dependencies, () => {
    	return gulp.src('./source/index.html')
		    .pipe(inject(gulp.src(['./source/styles/**/*.css'], { read: false }), { relative: true }))
		    .pipe(gulp.dest('./source'))
		    .pipe(notify({                                  // notify when done
		        message: 'SASS Task: CSS Injection Complete!'
		    }));
    })
}