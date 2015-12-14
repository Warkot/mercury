import App from '../app';
import DiscussionBaseRoute from './discussion-base';
import DiscussionPostModel from '../models/discussion-post';
import DiscussionRouteUpvoteMixin from '../mixins/discussion-route-upvote';
import DiscussionLayoutMixin from '../mixins/discussion-layout';
import DiscussionDeleteRouteMixin from '../mixins/discussion-delete-route';

export default App.DiscussionPostRoute = DiscussionBaseRoute.extend(
	DiscussionLayoutMixin,
	DiscussionRouteUpvoteMixin,
	DiscussionDeleteRouteMixin, {
		postDeleteFullScreenOverlay: true,

		/**
		 * @param {object} params
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

		setupController(controller, model, transition) {
			this._super(controller, model, transition);

			controller.set('intervalId', setInterval(function () {model.updateView();}, 10000));
		},

		resetController(controller, isExitting) {
			this._super.apply(this, arguments);

			if (isExitting && controller.get('intervalId')) {
				clearInterval(controller.get('intervalId'));
			}
		},

		actions: {
			/**
			 * Triggers new reply creation on a model
			 * @param {object} replyData
			 * @returns {void}
			 */
			create(replyData) {
				this.modelFor('discussion.post').createReply(replyData);
			},

			/**
			 * @param {number} forumId
			 * @param {string} sort
			 * @returns {void}
			 */
			goToForum(forumId, sort) {
				this.transitionTo('discussion.forum', forumId, sort);
			}
		}
	}
);
