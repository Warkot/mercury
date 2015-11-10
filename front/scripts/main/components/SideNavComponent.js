App.SideNavComponent = Em.Component.extend({
	tagName: 'nav',
	classNames: ['side-nav'],
	classNameBindings: ['shouldBeVisible:slide-into-view:collapsed'],

	isInSearchMode: false,
	searchQuery: '',
	searchPlaceholderLabel: Em.computed(() => {
		return i18n.t('app.search-label');
	}),

	shouldBeVisibleObserver: Em.observer('shouldBeVisible', function () {
		const trackLabel = this.get('shouldBeVisible') ? 'open' : 'close';

		M.track({
			action: M.trackActions.click,
			category: 'menu',
			label: trackLabel
		});
	}),

	/**
	 * Every time we exit search mode, regardless of if it was through the Cancel
	 * link or through clicking a search result, we want to clear out the query
	 * so that the search bar will clear.
	 */
	isInSearchModeObserver: Em.observer('isInSearchMode', function () {
		if (!this.get('isInSearchMode')) {
			this.send('clearSearch');
		}
	}).on('didInsertElement'),

	actions: {
		/**
		 * @returns {void}
		 */
		clearSearch() {
			this.set('searchQuery', '');
		},

		/**
		 * @returns {void}
		 */
		collapse() {
			this.sendAction('toggleVisibility', false);
			this.send('searchCancel');
		},

		/**
		 * @returns {void}
		 */
		expand() {
			this.sendAction('toggleVisibility', true);
		},

		/**
		 * @returns {void}
		 */
		searchCancel() {
			this.set('isInSearchMode', false);
			this.send('clearSearch');
		},

		/**
		 * @returns {void}
		 */
		searchFocus() {
			this.set('isInSearchMode', true);
			// Track when search is opened
			M.track({
				action: M.trackActions.click,
				category: 'search',
			});
		},

		/**
		 * @returns {void}
		 */
		loadRandomArticle() {
			this.sendAction('loadRandomArticle');
		},

		/**
		 * Handler for enter in search box
		 * Running A/B test to switch between using MediaWiki Special:Search and Google Custom Search
		 *
		 * @param {string} [value=''] - input value
		 * @returns {void}
		 */
		enter(value) {
			// Experiment id from Optimizely
			const experimentIds = {
					prod: '3571301500',
					dev: '3579160288'
				},
				variationNumber = Mercury.Utils.VariantTesting.getExperimentVariationNumber(experimentIds);

			if (variationNumber === 1) {
				// Use Google Search
				// Hide SideNav
				this.sendAction('toggleVisibility', false);
				this.send('searchCancel');

				this.sendAction('search', value);
			} else {
				// Use Wikia Search
				window.location.assign('%@Special:Search?search=%@&fulltext=Search'.fmt(Mercury.wiki.articlePath, value));
			}
		},
	},
});