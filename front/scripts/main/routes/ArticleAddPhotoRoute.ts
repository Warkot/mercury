/// <reference path="../app.ts" />
/// <reference path="../../../../typings/ember/ember.d.ts" />
/// <reference path="../mixins/FullPageMixin.ts"/>

'use strict';

App.ArticleAddPhotoRoute = Em.Route.extend(App.FullPageMixin, {
	/**
	 * @returns {void}
	 */
	renderTemplate(): void {
		console.log('ArticleAddPhotoRoute renderTemplate');

		this.render('article-add-photo', {
			controller: 'articleAddPhoto'
		});
	},

	actions: {
		/**
		 * @param {*} error
		 * @param {EmberStates.Transition} transition
		 * @returns {boolean}
		 */
		error(error: any, transition: EmberStates.Transition): boolean {
			console.log('ArticleAddPhotoRoute error');

			this.controllerFor('application').addAlert({
				message: i18n.t('app.addphoto-load-error'),
				type: 'alert'
			});
			M.track({
				action: M.trackActions.impression,
				category: 'sectionaddphoto',
				label: 'addphoto-load-error'
			});
			return true;
		},

		/**
		 * @returns {boolean}
		 */
		didTransition(): boolean {
			console.log('ArticleAddPhotoRoute didTransition');

			window.scrollTo(0, 0);

			M.track({
				action: M.trackActions.impression,
				category: 'sectionaddphoto',
				label: 'addphoto-loaded'
			});

			return true;
		}
	}
});
