import {test, moduleFor} from 'ember-qunit';

moduleFor('component:article-comment', {
	unit: true
});

test('users is correctly fetched', function () {
	expect(2);
	var component = this.subject();

	component.setProperties({
		users: {test: 'test'},
		comment: {userName: 'test'}
	});

	equal(component.get('user'), 'test');

	component.setProperties({
		users: {test: 'test'},
		comment: {userName: 'nope'}
	});

	deepEqual(component.get('user'), {});
});
