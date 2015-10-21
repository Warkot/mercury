/// <reference path="../../../../../typings/google.analytics/ga.d.ts" />
/// <reference path="../../../baseline/mercury.ts" />
/// <reference path="../../../baseline/mercury.d.ts" />

interface TrackerOptions {
	name: string;
	allowLinker: boolean;
	sampleRate: number;
}

/**
 * @typedef {Object} TrackerOptions
 * @property {string} name
 * @property {boolean} allowLinker
 * @property {number} sampleRate
 */

/**
 * @typedef {string|function} UniversalAnalyticsDimension
 */

/**
 * @typedef {Object} GAAccount
 * @property {string} id
 * @property {string} [prefix]
 * @property {number} sampleRate
 */

module Mercury.Modules.Trackers {
	export class UniversalAnalytics {
		static dimensions: (string|Function)[] = [];
		tracked: GAAccount[] = [];
		accounts: GAAccountMap;
		accountPrimary = 'primary';
		accountSpecial = 'special';
		accountAds = 'ads';

		/**
		 * @param {boolean} [isSpecialWiki=false]
		 * @returns {undefined}
		 */
		constructor (isSpecialWiki = false) {
			if (!UniversalAnalytics.dimensions.length) {
				throw new Error(
					'Cannot instantiate UA tracker: please provide dimensions using UniversalAnalytics#setDimensions'
				);
			}

			// All domains that host content for Wikia
			// Use one of the domains below. If none matches, the tag will fall back to
			// the default which is 'auto', probably good enough in edge cases.
			var domain: string = [
					'wikia.com', 'ffxiclopedia.org', 'jedipedia.de',
					'marveldatabase.com', 'memory-alpha.org', 'uncyclopedia.org',
					'websitewiki.de', 'wowwiki.com', 'yoyowiki.org'
				].filter((domain: string) => document.location.hostname.indexOf(domain) > -1)[0];

			this.accounts = M.prop('tracking.ua');

			// Primary account
			this.initAccount(this.accountPrimary, domain);

			this.initAccount(this.accountAds, domain);

			if (isSpecialWiki) {
				this.initAccount(this.accountSpecial, domain);
			}
		}

		/**
		 * Synchronously sets the UA dimensional context
		 *
		 * @param {UniversalAnalyticsDimension[]} dimensions - array of dimensions to set, may be strings or functions
		 * @param {boolean} overwrite - set to true to overwrite all preexisting dimensions and unset ones not declared
		 * @returns {boolean} true if dimensions were successfully set
		 */
		public static setDimensions (dimensions: typeof UniversalAnalytics.dimensions, overwrite?: boolean): boolean {
			if (!dimensions.length) {
				return false;
			}

			if (overwrite) {
				this.dimensions = dimensions;
			} else {
				$.extend(this.dimensions, dimensions);
			}

			return true;
		}

		/**
		 * Retrieves string value or invokes function for value
		 *
		 * @param {number} idx - index of dimension
		 * @returns {string}
		 */
		private getDimension (idx: number): string {
			var dimension = UniversalAnalytics.dimensions[idx];
			return typeof dimension === 'function' ? dimension() : dimension;
		}

		/**
		 * Initialize an additional account or property
		 *
		 * @param {string} trackerName - The name of the account as specified in localSettings
		 * @param {string} domain
		 * @returns {undefined}
		 */
		initAccount (trackerName: string, domain: string): void {
			var options: TrackerOptions, prefix: string,
				dimensionNum: string,
				trackerPrefix: string;

			options = {
				name: '',
				allowLinker: true,
				sampleRate: this.accounts[trackerName].sampleRate
			};
			prefix = '';

			// Primary account should not have a namespace prefix
			if (trackerName !== this.accountPrimary) {
				trackerPrefix = this.accounts[trackerName].prefix;
				prefix = trackerPrefix + '.';
				options.name = trackerPrefix;
			}

			ga('create', this.accounts[trackerName].id, 'auto', options);

			ga(prefix + 'require', 'linker');

			if (domain) {
				ga(prefix + 'linker:autoLink', domain);
			}

			UniversalAnalytics.dimensions.forEach((dimension: string|Function, idx: number) =>
				ga(`${prefix}set`, `dimension${idx}`, this.getDimension(idx)));

			this.tracked.push(this.accounts[trackerName]);
		}

		/**
		 * Returns proper prefix for given account
		 *
		 * @param {GAAccount} account
		 * @returns {string}
		 */
		private getPrefix(account: GAAccount): string {
			return account.prefix ? account.prefix + '.' : '';
		}

		/**
		 * Tracks an event, using the parameters native to the UA send() method
		 *
		 * @see {@link https://developers.google.com/analytics/devguides/collection/analyticsjs/method-reference}
		 *
		 * @param {string} category - Event category.
		 * @param {string} action - Event action.
		 * @param {string} label - Event label.
		 * @param {number} value - Event value. Has to be an integer.
		 * @param {boolean} nonInteractive - Whether event is non-interactive.
		 * @returns {undefined}
		 */
		track (category: string, action: string, label: string, value: number, nonInteractive: boolean): void {
			this.tracked.forEach((account: GAAccount) => {
				var prefix: string;
				// skip over ads tracker (as it's handled in self.trackAds)
				if (account.prefix !== this.accountAds) {
					var prefix = this.getPrefix(account);
					ga(`${prefix}send`, {
							hitType: 'event',
							eventCategory: category,
							eventAction: action,
							eventLabel: label,
							eventValue: value,
							nonInteraction: nonInteractive
						}
					);
				}
			});
		}

		/**
		 * Tracks an ads-related event
		 * @see {@link https://developers.google.com/analytics/devguides/collection/analyticsjs/method-reference}
		 *
		 * @param {string} category - Event category.
		 * @param {string} action - Event action.
		 * @param {string} label - Event label.
		 * @param {number} value - Event value. Has to be an integer.
		 * @param {boolean} nonInteractive - Whether event is non-interactive.
		 * @returns {undefined}
		 */
		trackAds (category: string, action: string, label: string, value: number, nonInteractive: boolean): void {
			ga(this.accounts[this.accountAds].prefix + '.send', {
					hitType: 'event',
					eventCategory: category,
					eventAction: action,
					eventLabel: label,
					eventValue: value,
					nonInteraction: nonInteractive
				}
			);
		}

		/**
		 * Updates current page
		 *
		 * from https://developers.google.com/analytics/devguides/collection/analyticsjs/single-page-applications :
		 * Note: if you send a hit that includes both the location and page fields and the path values are different,
		 * Google Analytics will use the value specified for the page field.
		 *
		 * @param {string} url
		 * @returns {undefined}
		 */
		updateTrackedUrl (url: string): void {
			var location: HTMLAnchorElement = document.createElement('a');
			location.href = url;

			this.tracked.forEach((account: GAAccount) => {
				var prefix = this.getPrefix(account);
				ga(`${prefix}set`, 'page', location.pathname);
			});
		}

		/**
		 * Tracks the current page view
		 *
		 * @returns {undefined}
		 */
		trackPageView (): void {
			var pageType = this.getDimension(8);

			if (!pageType) {
				throw new Error('missing page type dimension (#8)');
			}

			this.tracked.forEach((account: GAAccount) => {
				var prefix = this.getPrefix(account);
				ga(`${prefix}set`, 'dimension8', pageType, 3);
				ga(`${prefix}send`, 'pageview');
			});
		}
	}
}
