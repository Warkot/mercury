var paths = require('../gulp/paths');

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
		browsers: ['Chrome'],
		// coverage reporter generates the coverage
		reporters: ['progress', 'coverage'],

		basePath: '../',
		files: [
			// Vendor files
			paths.vendor.original + '/fastclick/lib/fastclick.js',
			paths.vendor.original + '/sinonjs/sinon.js',
			paths.vendor.original + '/sinon-qunit/lib/sinon-qunit.js',
			paths.vendor.original + '/jquery/dist/jquery.js',
			paths.vendor.original + '/ember/ember.debug.js',
			paths.vendor.original + '/i18next/i18next.js',
			paths.vendor.original + '/jquery.cookie/jquery.cookie.js',
			paths.vendor.original + '/vignette/dist/vignette.js',
			paths.vendor.original + '/weppy/dist/weppy.js',
			paths.vendor.original + '/ember-qunit/ember-qunit.js',
			paths.vendor.original + '/loader.js/loader.js',

			'test/fixtures/test-fixtures.js',

			// Ember templates
			paths.templates.dest + '/main.js',

			// Those files are tested
			paths.scripts.front.dest + '/baseline.js',
			paths.scripts.front.dest + '/test-modules.js',

			// Test helpers
			'test/helpers/**/*.js',

			// Test specs
			'test/specs/front/scripts/baseline/mercury/utils/isPrimitive.js',
			'test/specs/front/scripts/mercury/modules/Trackers/BaseTracker.js',
			'test/specs/front/scripts/mercury/modules/Trackers/Comscore.js',
			'test/specs/front/scripts/mercury/modules/Trackers/Internal.js',
			'test/specs/front/scripts/mercury/modules/Trackers/Quantserve.js',
			//'test/specs/front/scripts/mercury/modules/VideoLoader.js',
			//'test/specs/front/scripts/mercury/modules/VideoPlayers/Base.js',
		],

		exclude: [
			// TODO fix these tests and remove this line, see CONCF-413
			'test/specs/front/scripts/main/helpers/*.js',
		],

		preprocessors: {
			// source files, that you want to generate coverage for
			// do not include tests or libraries
			// (these files will be instrumented by Istanbul)
			'/**/front/scripts/*.js': ['coverage']
		},

		// optionally, configure the reporter
		coverageReporter: {
			dir: 'coverage/front',
			reporters: [
				{type: 'cobertura', subdir: '.', file: 'cobertura.xml'}
			]
		}
	});
};
