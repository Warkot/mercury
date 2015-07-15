/// <reference path="../app.ts" />
/// <reference path="../mixins/FeaturedContentMixin.ts" />
/// <reference path="../mixins/TrackClickMixin.ts"/>
/// <reference path="../mixins/ThirdsClickMixin.ts"/>
/// <reference path="../../mercury/utils/track.ts"/>
'use strict';

App.FeaturedContentVariation3Component = Em.Component.extend(App.FeaturedContentMixin, App.TrackClickMixin, App.ThirdsClickMixin, {
	classNames: ['featured-content-variation-3'],
	isTimeoutHandleSet: false,
	cycleTimeoutHandle: null,
	// This is how long it takes to read the item caption out loud ~2.5 times, based on guidelines from movie credits
	cycleInterval: 6250,
	showChevrons: Em.computed.readOnly('hasMultipleItems'),
	screenEdgeWidthRatio: Em.computed('hasMultipleItems', function (): number {
		if (this.get('hasMultipleItems')) {
			return (1 / 6);
		}
		return 0;
	}),

	rightClickHandler: function (): boolean {
		M.VariantTesting.trackEvent('featured-content-next');
		this.nextItem();
		this.resetCycleTimeout();
		return true;
	},

	leftClickHandler: function (): boolean {
		M.VariantTesting.trackEvent('featured-content-prev');
		this.prevItem();
		this.resetCycleTimeout();
		return true;
	},

	centerClickHandler: function (): boolean {
		this.stopCyclingThroughItems();
		this.trackClick('modular-main-page', 'featured-content');
		M.VariantTesting.trackEvent('featured-content-click');
		return false;
	},

	click: function (event: MouseEvent|Touch): void {
		this.callClickHandler(event, true);
	},

	cycleThroughItems: function (): void {
		if (this.get('hasMultipleItems') && !this.get('isTimeoutHandleSet')) {
			this.set('cycleTimeoutHandle', Em.run.later(this, (): void => {
				this.set('isTimeoutHandleSet', false);
				this.nextItem();
				this.cycleThroughItems();
			}, this.cycleInterval));
			this.set('isTimeoutHandleSet', true);
		}
	},

	stopCyclingThroughItems: function (): void {
		if (this.get('hasMultipleItems')) {
			Em.run.cancel(this.get('cycleTimeoutHandle'));
			this.set('isTimeoutHandleSet', false);
		}
	},

	resetCycleTimeout: function (): void {
		if (this.get('hasMultipleItems')) {
			this.stopCyclingThroughItems();
			this.cycleThroughItems();
		}
	},

	didInsertElement: function (): void {
		this.cycleThroughItems();
	},

	willDestroyElement: function (): void {
		this.stopCyclingThroughItems();
	}
});
