App.ArticleAddPhotoRoute = Em.Route.extend(App.FullPageMixin, {
	/**
	 * @returns {void}
	 */
	renderTemplate() {
		this.render('article-add-photo', {
			controller: 'articleAddPhoto'
		});
	},

	actions: {
		/**
		 * @returns {boolean}
		 */
		error() {
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
		didTransition() {
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