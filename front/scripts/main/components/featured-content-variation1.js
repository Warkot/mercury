import Ember from 'ember';
import FeaturedContentMixin from '../mixins/featured-content.js';
import TrackClickMixin from '../mixins/track-click.js';
import {trackEvent} from '../../mercury/utils/variantTesting.js';

const FeaturedContentVariation1Component = Ember.Component.extend(
	FeaturedContentMixin,
	TrackClickMixin,
	{
		classNames: ['featured-content-variation-1'],

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
		 * @returns {void}
		 */
		click() {
			trackEvent('featured-content-click');
			this.trackClick('modular-main-page', 'featured-content');
		},
	}
);

export default FeaturedContentVariation1Component;
