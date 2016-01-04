import Ember from 'ember';
import {test, moduleForComponent} from 'ember-qunit';

var originalThumbnailerGetThumbURL;

moduleForComponent('infobox-image-collection', 'Unit | Component | infobox image collection', {
	unit: true,

	beforeEach: function () {
		originalThumbnailerGetThumbURL = require('common/modules/Thumbnailer').default.getThumbURL;

		require('common/modules/Thumbnailer').default.getThumbURL = function (url, options) {
			return url + '/' + options.mode + '/' + options.width + '/' + options.height;
		};
	},

	afterEach: function () {
		require('common/modules/Thumbnailer').default.getThumbURL = originalThumbnailerGetThumbURL;
	}
});

test('computedHeight TALL infobox image 200x1000', function (assert) {
	var component = this.subject(),
		viewportDimensions = {
			width: 400
		},
		media = {
			height: 1000,
			width: 200
		},
		expected = 400;

	Ember.run(function () {
		component.set('viewportDimensions', viewportDimensions);

		assert.equal(component.computedHeight(media), expected);
	});
});

test('computedHeight WIDE infobox image 1000x200', function (assert) {
	var component = this.subject(),
		viewportDimensions = {
			width: 400
		},
		media = {
			height: 200,
			width: 1000
		},
		expected = 225;

	Ember.run(function () {
		component.set('viewportDimensions', viewportDimensions);

		assert.equal(component.computedHeight(media), expected);
	});
});

test('computedHeight infobox image 100x100', function (assert) {
	var component = this.subject(),
		viewportDimensions = {
			width: 400
		},
		media = {
			height: 100,
			width: 100
		},
		expected = 100;

	Ember.run(function () {
		component.set('viewportDimensions', viewportDimensions);

		assert.equal(component.computedHeight(media), expected);
	});
});
