import App from '../app';
import DiscussionPostModel from '../models/discussion-post';
import DiscussionRouteUpvoteMixin from '../mixins/discussion-route-upvote';
import DiscussionLayoutMixin from '../mixins/discussion-layout';

export default App.DiscussionPostRoute = Ember.Route.extend(DiscussionLayoutMixin, DiscussionRouteUpvoteMixin, {
	/**
	 * @param {*} params
	 * @returns {Ember.RSVP.Promise}
	 */
	model(params) {
		return DiscussionPostModel.find(Mercury.wiki.id, params.postId);
	},

	/**
	 * @param {DiscussionPostModel} model
	 * @returns {void}
	 */
	afterModel(model) {
		let title = model.get('title');

		if (!title) {
			title = i18n.t('main.share-default-title', {siteName: Mercury.wiki.siteName, ns: 'discussion'});
		}

		this.controllerFor('application').set('currentTitle', title);
	},

	/**
	 * @returns {void}
	 */
	activate() {
		this.controllerFor('application').setProperties({
			// Enables vertical-colored theme bar in site-head component
			themeBar: true,
			enableShareHeader: false
		});
		this._super();
	},

	/**
	 * @returns {void}
	 */
	deactivate() {
		this.controllerFor('application').setProperties({
			// Disables vertical-colored theme bar in site-head component
			themeBar: false,
			enableShareHeader: false
		});
		this._super();
	},

	actions: {
		/**
		 * @returns {void}
		 */
		retry() {
			this.refresh();
		},

		/**
		 * @returns {void}
		 */
		goToAllDiscussions() {
			this.transitionTo('discussion.index');
		},

		/**
		 * @returns {boolean}
		 */
		didTransition() {
			this.controllerFor('application').set('noMargins', true);
			return true;
		},

		deletePost(post) {
			this.modelFor('discussion.post').deletePost(post);
		},

		undeletePost(post) {
			this.modelFor('discussion.post').undeletePost(post);
		},

		/**
		 * @param {number} forumId
		 * @param {string} sort
		 * @returns {void}
		 */
		goToForum(forumId, sort) {
			this.transitionTo('discussion.forum', forumId, sort);
		},
	}
});
