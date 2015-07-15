moduleForComponent('main-page', 'MainPageComponent', {
	setup: function () {
		M.setTrackContext = function () {};
		M.trackPageView = function () {};
	}
});

test('reacts on curated content change', function () {
	var componentMock = this.subject(),
		adsContext = {
			valid: true
		};

	componentMock.injectMainPageAds = function () {
		ok(true, 'Main page ads injected');
	};

	componentMock.setupAdsContext = function (context) {
		equal(context, adsContext);
	};

	Ember.run(function () {
		componentMock.setProperties({
			adsContext: adsContext,
			curatedContent: {}
		});
	});
});