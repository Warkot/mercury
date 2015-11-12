

/**
 * @param {Array} params
 * @param {Object} options
 * @returns {string}
 */
const I18nHelper = Ember.Helper.helper((params, options) => {
	const i18nParams = {},
		value = params.join('.');

	let namespace = 'main';

	/**
	 * @param {string} key
	 * @returns {void}
	 */
	Object.keys(options).forEach((key) => {
		if (key === 'ns') {
			namespace = options[key];
		} else if (key !== 'boundOptions' && options.hasOwnProperty(key)) {
			i18nParams[key] = String(options[key]);
		}
	});

	return i18n.t(`${namespace}:${value}`, i18nParams);
});

export default I18nHelper;
