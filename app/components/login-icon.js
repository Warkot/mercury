import Ember from 'ember';

export default Ember.Component.extend({
	// This was disabled for now and should be re-enabled with https://wikia-inc.atlassian.net/browse/SOC-633 when
	// we're ready to launch the new auth pages.
	tagName: 'a',
	classNames: ['external', 'login'],
	//Let's remove this flag once we're good to go with the new login flow
	newLoginEnabled: true,
	newLoginWhitelist: [
		'clashofclans',
		'creepypasta',
		'castleclash',
		'glee',
		'mobileregressiontesting'
	],
	click () {
		if (this.shouldRedirectToNewLogin()) {
			window.location.href = '/join?redirect=' + encodeURIComponent(window.location.href);
		} else {
			window.location.href = '/Special:UserLogin';
		}
	},

	/**
	 * Redirects to new login flow if a wiki is whitelisted above
	 * @returns {boolean}
	 */
	shouldRedirectToNewLogin () {
		var dbName = Mercury.wiki.dbName;

		if (!this.newLoginEnabled) {
			return false;
		}

		return this.newLoginWhitelist.some((whitelistedDBName) =>
			whitelistedDBName === dbName
		);
	}
});
