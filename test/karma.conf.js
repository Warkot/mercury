/*
 * karma.conf.js
 * @description Karma configuration file. The src files are managed by the 'karma'
 * gulp task
 */
module.exports = function (config) {
	config.set({
		frameworks: ['qunit'],
		autoWatch: true,
		singleRun: true,
		browsers: ['PhantomJS'],
		// coverage reporter generates the coverage
		reporters: ['progress', 'coverage'],

		preprocessors: {
			// source files, that you wanna generate coverage for
			// do not include tests or libraries
			// (these files will be instrumented by Istanbul)
			'**/public/**/*.js': ['coverage']
		},

		// optionally, configure the reporter
		coverageReporter: {
			type : 'html',
			dir : 'coverage/'
		}
	});
};
