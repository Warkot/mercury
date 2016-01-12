import LanguagesMixin from '../mixins/languages';

const WikiaInYourLangModel = Ember.Object.extend(LanguagesMixin, {
	message: null,
	nativeDomain: null
});

WikiaInYourLangModel.reopenClass(LanguagesMixin, {
	/**
	 * @param {string} userLang
	 * @returns {Ember.RSVP.Promise}
	 */
	load(userLang) {
		const model = WikiaInYourLangModel.getFromCache(userLang);

		return new Ember.RSVP.Promise((resolve, reject) => {
			if (model) {
				resolve(model);
				return;
			}

			Ember.$.getJSON(
				M.buildUrl({path: '/wikia.php'}),
				{
					controller: 'WikiaInYourLangController',
					method: 'getNativeWikiaInfo',
					format: 'json',
					targetLanguage: userLang
				}
			).done((resp) => {
				let modelInstance = null;

				if (resp.success) {
					modelInstance = WikiaInYourLangModel.create({
						nativeDomain: resp.nativeDomain,
						message: resp.messageMobile
					});
				}

				// write to cache
				window.localStorage.setItem(
					WikiaInYourLangModel.getCacheKey(userLang),
					JSON.stringify({
						model: modelInstance,
						timestamp: new Date().getTime()
					})
				);

				resolve(modelInstance);
			}).fail((err) => {
				reject(err);
			});
		});
	},

	/**
	 * @param {string} userLang
	 * @returns {WikiaInYourLangModel}
	 */
	getFromCache(userLang) {
		const key = WikiaInYourLangModel.getCacheKey(userLang),
			value = JSON.parse(window.localStorage.getItem(key)),
			now = new Date().getTime();

		// we cache for 30 days (2592000000)
		if (!value || now - value.timestamp > 2592000000) {
			return null;
		}

		return value.model;
	},

	/**
	 * @param {string} lang
	 * @returns {string}
	 */
	getCacheKey(lang) {
		return `${lang}-WikiaInYourLang`;
	}
});

export default WikiaInYourLangModel;
