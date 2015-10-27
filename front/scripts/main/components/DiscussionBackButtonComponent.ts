/// <reference path="../app.ts" />
'use strict';

App.DiscussionBackButtonComponent = Em.Component.extend({
	tagName: 'a',
	classNames: ['back-button'],
	attributeBindings: ['href'],
	href: null,
	label: '',

	/**
	 * @returns {undefined}
	 */
	click(): void {
		this.sendAction('setLocation');
	}
});
