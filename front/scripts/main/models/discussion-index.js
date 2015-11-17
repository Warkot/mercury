


App.DiscussionIndexModel = Ember.Object.extend({
});

DiscussionIndexModel.reopenClass({
	/**
	 * @param {number} wikiId
	 * @returns {Ember.RSVP.Promise}
	 */
	find(wikiId) {
		return new Ember.RSVP.Promise((resolve, reject) => {
			Ember.$.ajax({
				url: getDiscussionServiceUrl(`/discussion/${wikiId}/forums`),
				dataType: 'json',
				success: (data) => resolve(data),
				error: (err) => reject(err)
			});
		});
	}
});


