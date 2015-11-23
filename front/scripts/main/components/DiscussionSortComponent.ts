/// <reference path="../app.ts" />
'use strict';

App.DiscussionSortComponent = Em.Component.extend({
	classNames: ['discussion-sort', 'clearfix'],
	classNameBindings: ['sortVisible::mobile-hidden'],
	tagName: 'ul',

	// Whether the component is currently visible
	sortVisible: false,
	// jQuery object for this component
	$discussionSort: null,

	sortByObserver: Em.observer('sortBy', function (): void {
		this.updateActive();
	}),

	actions: {
		/**
		 * @param {string} sortBy
		 * @returns {void}
		 */
		setSortBy(sortBy: string): void {
			// Send action up to route object
			this.sendAction('setSortBy', sortBy);
		},
	},

	/**
	 * @returns {void}
	 */
	didInsertElement(): void {
		this.set('$discussionSort', $('.discussion-sort'));
		this.updateActive();
		this._super();
	},

	/**
	 * @returns {void}
	 */
	updateActive(): void {
		var activeClass: string = 'active active-element-theme-color active-element-border-theme-color',
			notActiveClass: string = 'not-active';

		// Add the 'active' CSS class to the sort tab that's active,
		// but right now this only applies to desktop styling.
		var $discussionSort: JQuery = this.get('$discussionSort');

		if ($discussionSort === null) {
			return;
		}

		$discussionSort.find('li.active').removeClass(activeClass).addClass(notActiveClass);
		$discussionSort.find('li[data-type="' + this.get('sortBy') + '"]').removeClass(notActiveClass).addClass(activeClass);
	},
});