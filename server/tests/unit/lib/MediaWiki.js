QUnit.module('lib/MediaWiki', {
});

test('createURL', function () {
	global.localSettings.default.environment = 'dev';
	global.localSettings.default.devboxDomain = 'test';
	global.localSettings.default.mediawikiDomain = undefined;

	equal(global.createUrl('foo.test.wikia-dev.com', 'api/test', {}),
		'http://foo.test.wikia-dev.com/api/test', 'zero query params');
	equal(global.createUrl('foo.test.wikia-dev.com', 'api/test', {
		title: 'bar'
	}), 'http://foo.test.wikia-dev.com/api/test?title=bar', 'one query param');
	equal(global.createUrl('foo.test.wikia-dev.com', 'api/test',{
		title: 'bar',
		param: 'gibberish'
	}), 'http://foo.test.wikia-dev.com/api/test?title=bar&param=gibberish', 'two query params');
	equal(global.createUrl('foo.test.wikia-dev.com', 'api/test'),
		'http://foo.test.wikia-dev.com/api/test', 'missing query params');

	global.localSettings.default.mediawikiDomain = 'mediawiki.service.consul';
	equal(global.createUrl('foo.test.wikia-dev.com', 'api/test', {}),
		'http://mediawiki.service.consul/api/test', 'consul url rewrite');
});

test('Constructors', function () {
	var testCases = [
		{
			name: 'ArticleRequest',
			data: {
				title: 'title',
				name: 'name'
			}
		} , {
			name: 'WikiRequest',
			data: {
				name: 'name'
			}
		} , {
			name: 'SearchRequest',
			data: {
				name: 'name'
			}
		}
	];
	testCases.forEach(function (testCase) {
		equal(typeof global[testCase.name], 'function', testCase.name + ' be a function');
		equal(typeof new global[testCase.name](testCase.data), 'object', testCase.name + ' be a constructor function');
	});
});
