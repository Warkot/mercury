import {trackGoogleSearch} from '../../mercury/utils/track';
import App from '../app';

App.SearchResultsRoute = Ember.Route.extend({
	// Don't let the script to start loading multiple times (user opens the route, goes back, opens it again)
	googleCustomSearchLoadingInitialized: false,

	/**
	 * @param {Ember.Object} controller
	 * @param {Ember.Object} model
	 * @param {EmberStates.Transition} transition
	 * @returns {void}
	 */
	setupController(controller, model, transition) {
		this._super(controller, model, transition);
		// Only search in current community
		controller.set('site', window.location.hostname);

		// Send extra tracking info to GA to track search usage
		trackGoogleSearch(`${window.location.href}search?q=${controller.get('q')}`);
	},

	/**
	 * Return a promise and resolve only after script is loaded - this way the route won't load before it happens
	 *
	 * @returns {Ember.RSVP.Promise}
	 */
	beforeModel() {
		if (!this.get('googleCustomSearchLoadingInitialized')) {
			return this.loadGoogleCustomSearch();
		}

		return new Ember.RSVP.Promise.resolve();
	},

	/**
	 * @returns {JQueryXHR}
	 */
	loadGoogleCustomSearch() {
		const searchKey = '006230450596576500385:kcgbfm7zpa8',
			url = `${(document.location.protocol === 'https:' ? 'https:' : 'http:')}` +
				`//www.google.com/cse/cse.js?cx=${searchKey}`;

		this.set('googleCustomSearchLoadingInitialized', true);
		return Ember.$.getScript(url);
	},
});
