/// <reference path="../app.ts" />

App.DiscussionIndexModel = Em.Object.extend({
});

App.DiscussionIndexModel.reopenClass({
	find(wikiId: number) {
		return new Em.RSVP.Promise((resolve: Function, reject: Function) => {
			Em.$.ajax({
				url: `https://services.wikia-dev.com/discussion/${wikiId}/forums`,
				dataType: 'json',
				success: (data) => resolve(data),
				error: (err) => reject(err)
			});
		});
	},
});
