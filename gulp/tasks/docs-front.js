 /*
 * docs-front
 * Creates documentation for front scripts in mercury/docs/front/
 */

var gulp = require('gulp'),
	typedoc = require('gulp-typedoc'),
	paths = require('../paths'),
	options = require('../options').doc.front;

gulp.task('docs-front', function() {
	return gulp
		.src([paths.scripts.front.src + '/' + paths.scripts.front.files])
		.pipe(typedoc(options));
});
