/// <reference path="../app.ts" />
/// <reference path="../../../../typings/ember/ember.d.ts" />
'use strict';
App.MainPageRoute = Em.Route.extend({
    beforeModel: function (transition) {
        this.transitionTo('article', Em.get(Mercury, 'wiki.mainPageTitle'));
    }
});
