/// <reference path="../app.ts" />
/// <reference path="../../../../typings/ember/ember.d.ts" />

'use strict';

App.ArticleRoute = Em.Route.extend({
	queryParams: {
		comments_page: {
			replace: true
		}
	},

	beforeModel: function (transition: EmberStates.Transition) {
		var title = transition.params.article.title.replace('wiki/', '');

		if (Mercury.error) {
			transition.abort();
		}

		this.controllerFor('application').send('closeLightbox');

		if (title === Mercury.wiki.mainPageTitle) {
			this.transitionTo('mainPage');
		}

		// If you try to access article with not-yet-sanitized title you can see in logs:
		// `Transition #1: detected abort.`
		// This is caused by the transition below but doesn't mean any additional requests.
		// TODO: This could be improved upon by not using an Ember transition to 'rewrite' the URL
		// Ticket here: https://wikia-inc.atlassian.net/browse/HG-641
		if (title.match(/\s/)) {
			this.transitionTo('article',
				M.String.sanitize(title)
			);
		}
	},

	model: function (params: any) {
		return App.ArticleModel.find({
			basePath: Mercury.wiki.basePath,
			title: params.title,
			wiki: this.controllerFor('application').get('domain')
		});
	},

	afterModel: function (model: typeof App.ArticleModel) {
		if (model.isMainPage) {
			this.transitionTo('mainPage', model);
		}

		this.controllerFor('application').set('currentTitle', model.get('title'));
		App.VisibilityStateManager.reset();

		// Reset query parameters
		model.set('commentsPage', null);
	},

	actions: {
		error: function (error: any, transition: EmberStates.Transition) {
			if (transition) {
				transition.abort();
			}
			Em.Logger.warn('ArticleRoute error', error.stack || error);
			return true;
		},

		willTransition: function (transition: EmberStates.Transition) {
			// notify a property change on soon to be stale model for observers (like
			// the Table of Contents menu) can reset appropriately
			this.notifyPropertyChange('cleanTitle');
		},
		// TODO: This currently will scroll to the top even when the app has encountered
		// an error. Optimally, it would remain in the same place.
		didTransition: function () {
			window.scrollTo(0, 0);
			// bubble up to application didTransition hook
			return true;
		}
	}
});
