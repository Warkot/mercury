import Ember from 'ember';
import FeaturedContentMixin from '../mixins/featured-content.js';
import TrackClickMixin from '../mixins/track-click.js';
import ThirdsClickMixin from '../mixins/thirds-click.js';
import {trackEvent} from '../../mercury/utils/variantTesting.js';

const FeaturedContentComponent = Ember.Component.extend(
	FeaturedContentMixin,
	TrackClickMixin,
	ThirdsClickMixin,
	{
		// See ThirdsClickMixin
		screenEdgeWidthRatio: (1 / 6),

		gestures: {
			/**
			 * @returns {void}
			 */
			swipeLeft() {
				trackEvent('featured-content-next');
				this.nextItem();
			},

			/**
			 * @returns {void}
			 */
			swipeRight() {
				trackEvent('featured-content-prev');
				this.prevItem();
			},
		},

		/**
		 * @returns {boolean}
		 */
		rightClickHandler() {
			trackEvent('featured-content-next');
			this.nextItem();
			return true;
		},

		/**
		 * @returns {boolean}
		 */
		leftClickHandler() {
			trackEvent('featured-content-prev');
			this.prevItem();
			return true;
		},

		/**
		 * @returns {boolean}
		 */
		centerClickHandler() {
			this.trackClick('modular-main-page', 'featured-content');
			trackEvent('featured-content-click');
			return false;
		},

		/**
		 * @param {PreventableClickEvent} event
		 * @returns {void}
		 */
		click(event) {
			this.callClickHandler(event, true);
		},
	}
);

export default FeaturedContentComponent;
