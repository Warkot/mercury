import App from '../app';
import DiscussionDeleteControllerMixin from '../mixins/discussion-delete-controller';

export default App.DiscussionForumController = Ember.Controller.extend(DiscussionDeleteControllerMixin, {
	application: Ember.inject.controller(),
	sortBy: null,

	smartBannerVisible: Ember.computed.oneWay('application.smartBannerVisible'),
	siteHeadPinned: Ember.computed.oneWay('application.siteHeadPinned'),

	// Whether the sort component is currently visible
	sortVisible: false,

	editorActive: false,

	sortTypes: [
		{
			name: 'trending',
			messageKey: 'main.sort-by-trending'
		},
		{
			name: 'latest',
			messageKey: 'main.sort-by-latest'
		}
	],

	sortMessageKey: Ember.computed('sortBy', function () {
		const sortTypes = this.get('sortTypes'),
			filtered = sortTypes.filter((obj) => {
				return obj.name === this.get('sortBy');
			});

		return filtered.length ? filtered[0].messageKey : sortTypes[0].messageKey;
	}),

	willDestroy () {
		this._super();

		clearInterval(this.get('intervalId'));
	},

	init () {
		let context, intervalId;

		this._super();

		if (!this.get('intervalId')) {
			context = this;
			intervalId = setInterval(function () {
				const model = context.get('model');
				model.updateView(context.get('sortBy'));
			}, 10000);

			this.set('intervalId', intervalId);
		}
	},

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
		},

		toggleEditorActive(active) {
			this.set('editorActive', active);
		}
	}
});
