import App from '../app';
import DiscussionBaseRoute from './discussion-base';
import DiscussionRouteUpvoteMixin from '../mixins/discussion-route-upvote';
import DiscussionForumModel from '../models/discussion-forum';
import DiscussionLayoutMixin from '../mixins/discussion-layout';
import DiscussionDeleteRouteMixin from '../mixins/discussion-delete-route';

export default App.DiscussionForumRoute = DiscussionBaseRoute.extend(
	DiscussionLayoutMixin,
	DiscussionRouteUpvoteMixin,
	DiscussionDeleteRouteMixin, {
		defaultSortType: 'trending',
		forumId: null,

		/**
		 * @param {object} params
		 * @returns {Ember.RSVP.Promise}
		 */
		model(params) {
			const sortBy = params.sortBy || this.defaultSortType;

			this.set('forumId', params.forumId);

			return DiscussionForumModel.find(Mercury.wiki.id, params.forumId, sortBy);
		},

		/**
		 * @param {Ember.Controller} controller
		 * @param {Ember.Object} model
		 * @param {EmberStates.Transition} transition
		 * @returns {void}
		 */
		setupController(controller, model, transition) {
			this._super(controller, model, transition);
			controller.set('sortBy', transition.params['discussion.forum'].sortBy || this.defaultSortType);

			controller.set('intervalId',
				setInterval(function () {
					model.updateView(controller.get('sortBy'));
				}, 10000)
			);
		},

		resetController(controller, isExitting) {
			this._super.apply(this, arguments);

			if (isExitting && controller.get('intervalId')) {
				clearInterval(controller.get('intervalId'));
			}
		},

		/**
		 * @param {string} sortBy
		 * @returns {EmberStates.Transition}
		 */
		setSortBy(sortBy) {
			const controller = this.controllerFor('discussionForum');

			controller.set('sortBy', sortBy);

			if (controller.get('sortAlwaysVisible') !== true) {
				this.controllerFor('discussionForum').set('sortVisible', false);
			}

			return this.transitionTo('discussion.forum', this.get('forumId'), sortBy);
		},

		actions: {
			/**
			 * @param {number} postId
			 * @param {bool} openInNewTab
			 * @returns {void}
			 */
			goToPost(postId, openInNewTab = false) {
				if (openInNewTab) {
					window.open(this.get('router').generate('discussion.post', postId));
				} else {
					const postController = this.controllerFor('discussionPost'),
						forumController = this.controllerFor('discussionForum');

					postController.set('postListSort', forumController.get('sortBy'));
					this.transitionTo('discussion.post', postId);
				}
			},

			/**
			 * @param {number} pageNum
			 * @returns {void}
			 */
			loadPage(pageNum) {
				const sortBy = this.controllerFor('discussionForum').get('sortBy') || this.defaultSortType;

				this.modelFor('discussion.forum').loadPage(pageNum, sortBy);
			},

			create(postData) {
				this.setSortBy('latest').promise.then(() => {
					this.modelFor('discussion.forum').createPost(postData);
				});
			},

			/**
			 * @param {string} sortBy
			 * @returns {void}
			 */
			setSortBy(sortBy) {
				this.setSortBy(sortBy);
			},
		}
	}
);
