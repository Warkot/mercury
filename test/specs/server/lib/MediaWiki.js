QUnit.module('lib/MediaWiki', {
	setup: function () {
		this.notFoundResponse = require('../../../fixtures/not-found.json');
	},
	teardown: function () {

	}
});

test('createURL', function () {
	global.localSettings.environment = 'dev';
	equal(global.createUrl('foo', 'api/test', { }),
		'http://foo.kenneth.wikia-dev.com/api/test', 'zero query params');
	equal(global.createUrl('foo', 'api/test', {
		title: 'bar'
	}), 'http://foo.kenneth.wikia-dev.com/api/test?title=bar', 'one query param');
	equal(global.createUrl('foo', 'api/test',{
		title: 'bar',
		param: 'gibberish'
	}), 'http://foo.kenneth.wikia-dev.com/api/test?title=bar&param=gibberish', 'two query params');
});

test('ArticleRequest class', function () {
	var instance = new global.ArticleRequest({
		name: 'foo',
		title: 'bar'
	});
	equal(typeof global.ArticleRequest, 'function', 'be a constructor function');
});

// May be better suited for integrating testing
test('receives article content on fetch', function () {
	stop();
	expect(1);
	var request = new global.ArticleRequest({
		name: 'starwars',
		title: 'Chewbacca'
	});
	request.article().then(function(response) {
		// console.log(response);
		ok(response.payload &&
			response.payload.article,
			'received article');
		start();
	});
});

// May be better suited for integrating testing
test('receives error message on invalid fetch', function () {
	self = this;
	stop();
	expect(1);
	var request = new global.ArticleRequest({
		name: "alsjdflkajsdlfjasd",
		title: "ckxoOOOOO"
	});
	// Note that this does not robustly test the request, it only checks that if all else
	// is good, then if the wiki name and article title are bad then we get the response
	// we expect
	request.article().then(function(response) {
		deepEqual(response,
			self.notFoundResponse,
			'gets error on bad article request');
		start();
	});
});
