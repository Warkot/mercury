import Ember from 'ember';

const ArticleEditController = Ember.Controller.extend({
	application: Ember.inject.controller(),

	isPublishing: false,

	publishDisabled: Ember.computed('isPublishing', 'model.isDirty', function () {
		return (this.get('isPublishing') === true || this.get('model.isDirty') === false);
	}),

	// FIXME: Cover more errors
	errorCodeMap: {
		autoblockedtext: 'app.edit-publish-error-autoblockedtext',
		blocked: 'app.edit-publish-error-blocked',
		noedit: 'app.edit-publish-error-noedit',
		'noedit-anon': 'app.edit-publish-error-noedit-anon',
		protectedpage: 'app.edit-publish-error-protectedpage'
	},

	/**
	 * @returns {void}
	 */
	handlePublishSuccess() {
		const title = this.get('model.title');

		this.transitionToRoute('article', title).then(() => {
			this.get('application').addAlert({
				message: i18n.t('app.edit-success', {
					pageTitle: title
				}),
				type: 'success'
			});
			this.set('isPublishing', false);
		});

		M.track({
			action: M.trackActions.impression,
			category: 'sectioneditor',
			label: 'success'
		});
	},

	/**
	 * @param {*} error
	 * @returns {void}
	 */
	handlePublishError(error) {
		const appController = this.get('application'),
			errorMsg = this.errorCodeMap[error] || 'app.edit-publish-error';

		appController.addAlert({
			message: i18n.t(errorMsg),
			type: 'alert'
		});

		appController.set('isLoading', false);

		this.set('isPublishing', false);

		M.track({
			action: M.trackActions.impression,
			category: 'sectioneditor',
			label: error || 'edit-publish-error'
		});
	},

	actions: {
		/**
		 * @returns {void}
		 */
		publish() {
			this.set('isPublishing', true);
			this.get('application').set('isLoading', true);

			ArticleEditModel.publish(this.get('model')).then(
				this.handlePublishSuccess.bind(this),
				this.handlePublishError.bind(this)
			);

			M.track({
				action: M.trackActions.click,
				category: 'sectioneditor',
				label: 'publish'
			});
		},
		/**
		 * @returns {void}
		 */
		back() {
			this.transitionToRoute('article', this.get('model.title'));
			M.track({
				action: M.trackActions.click,
				category: 'sectioneditor',
				label: 'back',
				value: this.get('publishDisabled')
			});
		}
	}
});

export default ArticleEditController;
