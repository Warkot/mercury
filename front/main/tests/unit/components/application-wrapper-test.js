import Ember from 'ember';
import {test, moduleForComponent} from 'ember-qunit';

moduleForComponent('application-wrapper', 'Unit | Component | application wrapper', {
	unit: true
});

test('shouldHandleClick returns correct value', function (assert) {
	var component = this.subject(),
		testCases = [
			{
				target: '<li class="mw-content"></li>',
				expected: true
			},
			{
				target: '<li></li>',
				expected: false
			},
			{
				target: '<div class="PDS_Poll"></div>',
				expected: false
			}
		];

	Ember.run(function () {
		testCases.forEach(function(testCase) {
			assert.equal(component.shouldHandleClick(testCase.target), testCase.expected);
		});
	});
});
