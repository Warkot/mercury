/// <reference path="../app.ts" />
/// <reference path="../../../../typings/ember/ember.d.ts" />

'use strict';

App.ArticleRoute = Em.Route.extend({
	redirectEmptyTarget: false,

	/**
	 * @param {EmberStates.Transition} transition
	 * @returns {void}
	 */
	beforeModel: function (transition: EmberStates.Transition):void {
		var title = transition.params.article.title.replace('wiki/', '');

		if (Mercury.error) {
			if (Mercury.error.code === 404) {
				this.transitionTo('notFound');
			} else {
				Em.Logger.debug('App error: ', Mercury.error);
				transition.abort();
			}
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
				M.String.normalizeToUnderscore(title)
			);
		}
	},

	/**
	 * @param {any} params
	 * @returns {Em.RSVP.Promise}
	 */
	model(params: any): Em.RSVP.Promise {
		return App.ArticleModel.find({
			basePath: Mercury.wiki.basePath,
			title: params.title,
			wiki: this.controllerFor('application').get('domain')
		});
	},

	/**
	 * @param {App.ArticleModel} model
	 * @returns {void}
	 */
	afterModel(model: typeof App.ArticleModel): void {
		// if an article is main page, redirect to mainPage route
		// this will handle accessing /wiki/Main_Page if default main page is different article
		if (model.isMainPage) {
			this.replaceWith('mainPage');
		}

		this.controllerFor('application').set('currentTitle', model.get('title'));
		App.VisibilityStateManager.reset();

		// Reset query parameters
		model.set('commentsPage', null);

		this.set('redirectEmptyTarget', model.get('redirectEmptyTarget'));
	},

	/**
	 * @returns {void}
	 */
	activate (): void {
		this.controllerFor('application').set('enableShareHeader', true);
	},

	/**
	 * @returns {void}
	 */
	deactivate (): void {
		this.controllerFor('application').set('enableShareHeader', false);
	},

	actions: {
		/**
		 * @param {EmberStates.Transition} transition
		 * @returns {void}
		 */
		willTransition(transition: EmberStates.Transition): void {
			// notify a property change on soon to be stale model for observers (like
			// the Table of Contents menu) can reset appropriately
			this.notifyPropertyChange('cleanTitle');
		},

		/**
		 * @returns {boolean}
		 */
		didTransition(): boolean {
			if (this.get('redirectEmptyTarget')) {
				this.controllerFor('application').addAlert({
					message: i18n.t('app.article-redirect-empty-target'),
					type: 'warning'
				});
			}
			return true;
		},

		/**
		 * @param {any} error
		 * @param {EmberStates.Transition} transition
		 * @returns {boolean}
		 */
		error(error: any, transition: EmberStates.Transition): boolean {
			if (transition) {
				transition.abort();
			}
			Em.Logger.warn('Route error', error.stack || error);
			return true;
		}
	}
});
