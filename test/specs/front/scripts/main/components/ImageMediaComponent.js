moduleForComponent('image-media', 'ImageMediaComponent');

test('computedHeight article image 200x1000', function () {
	var component = this.subject(),
			articleContent = {
				width: 400
			},
			media = {
				height: 1000,
				width: 200
			},
			expected = 1000;

	Ember.run(function () {
		component.set('media', media);
		component.set('articleContent', articleContent);

		equal(component.get('computedHeight'), expected);
	});
});

test('computedHeight article image 1000x200', function () {
	var component = this.subject(),
			articleContent = {
				width: 400
			},
			media = {
				height: 200,
				width: 1000
			},
			expected = 80;

	Ember.run(function () {
		component.set('media', media);
		component.set('articleContent', articleContent);

		equal(component.get('computedHeight'), expected);
	});
});