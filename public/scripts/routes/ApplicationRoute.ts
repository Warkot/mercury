/// <reference path="../app.ts" />
'use strict';

App.ApplicationRoute = Em.Route.extend({
	model: function <T> (params: T): T {
		return params;
	}
});
