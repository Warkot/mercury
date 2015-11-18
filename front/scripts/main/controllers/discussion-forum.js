import App from '../app';

App.DiscussionForumController = Ember.Controller.extend({
	application: Ember.inject.controller(),
	sortBy: null,

	smartBannerVisible: Ember.computed.oneWay('application.smartBannerVisible'),

	// Whether the sort component is currently visible
	sortVisible: false,

	sortTypes: [
		{
			name: 'latest',
			messageKey: 'main.sort-by-latest'
		},
		{
			name: 'trending',
			messageKey: 'main.sort-by-trending'
		}
	],

	sortMessageKey: Ember.computed('sortBy', function () {
		const sortTypes = this.get('sortTypes'),
			filtered = sortTypes.filter((obj) => {
				return obj.name === this.get('sortBy');
			});

		return filtered.length ? filtered[0].messageKey : sortTypes[0].messageKey;
	}),

	actions: {
		/**
		 * @returns {void}
		 */
		showSortComponent() {
			this.set('sortVisible', true);
		},

		/**
		 * @returns {void}
		 */
		hideSortComponent() {
			this.set('sortVisible', false);
		},

		/**
		 * Bubbles up to DiscussionForumRoute
		 *
		 * @returns {void}
		 */
		retry() {
			this.get('target').send('retry');
		},

		/**
		 * Bubbles up to DiscussionForumRoute
		 *
		 * @returns {void}
		 */
		goToAllDiscussions() {
			this.get('target').send('goToAllDiscussions');
		}
	}
});

export default App.DiscussionForumController;
