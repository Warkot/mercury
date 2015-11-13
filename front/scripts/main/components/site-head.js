
import Mercury from '../../mercury/Mercury';
import TrackClickMixin from '../mixins/track-click';
import HeadroomMixin from '../mixins/headroom';

const SiteHeadComponent = Ember.Component.extend(
	TrackClickMixin,
	HeadroomMixin,
	{
		classNames: ['site-head'],
		classNameBindings: ['themeBar'],
		tagName: 'nav',
		themeBar: false,
		wikiaHomepage: Ember.getWithDefault(Mercury, 'wiki.homepage', 'http://www.wikia.com'),

		actions: {
			/**
			 * @returns {void}
			 */
			expandSideNav() {
				this.sendAction('toggleSideNav', true);
			},

			/**
			 * @returns {void}
			 */
			showUserMenu() {
				this.sendAction('toggleUserMenu', true);
			},
		},
	}
);

export default SiteHeadComponent;