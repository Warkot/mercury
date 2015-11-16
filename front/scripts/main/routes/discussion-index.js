import App from '../app';
import DiscussionIndexModel from '../models/discussion-index';

App.DiscussionIndexRoute = Ember.Route.extend({
	/**
	 * @returns {void}
	 */
	beforeModel() {
		const controller = this.controllerFor('discussionForum');

		this.transitionTo('discussion.forum', Mercury.wiki.id, controller.get('sortTypes')[0].name);
	},

	/**
	 * @returns {*}
	 */
	model() {
		return DiscussionIndexModel.find(Mercury.wiki.id);
	}
});
