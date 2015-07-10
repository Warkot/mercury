/// <reference path="../app.ts" />
'use strict';

interface FeaturedContentItem {
	title: string;
	label: string;
	image_id: string;
	article_id: number;
	type: string;
	image_url: string;
	article_local_url: string;
}

App.FeaturedContentMixin = Em.Mixin.create({
	layoutName: 'components/featured-content',
	classNames: ['featured-content'],
	currentItemIndex: 0,

	hasMultipleItems: Em.computed('model', function (): boolean {
		return this.get('model.length') > 1;
	}),

	currentItem: Em.computed('model', 'currentItemIndex', function (): FeaturedContentItem {
		return this.get('model')[this.get('currentItemIndex')];
	}),

	lastIndex: Em.computed('model', function (): number {
		return this.get('model.length') - 1;
	}),

	/**
	 * @desc Keep pagination up to date
	 */
	currentItemIndexObserver: Em.observer('currentItemIndex', function (): void {
		var $pagination = this.$('.featured-content-pagination');
		$pagination.find('.current').removeClass('current');
		$pagination.find(`li[data-index=${this.get('currentItemIndex')}]`).addClass('current');
	}).on('didInsertElement'),

	prevItem: function (): void {
		if (this.get('hasMultipleItems')) {
			if (this.get('currentItemIndex') === 0) {
				this.set('currentItemIndex', this.get('lastIndex'));
			} else {
				this.decrementProperty('currentItemIndex');
			}
		}
	},

	nextItem: function (): void {
		if (this.get('hasMultipleItems')) {
			if (this.get('currentItemIndex') >= this.get('lastIndex')) {
				this.set('currentItemIndex', 0);
			} else {
				this.incrementProperty('currentItemIndex');
			}
		}
	}
});
