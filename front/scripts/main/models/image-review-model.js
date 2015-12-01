import App from '../app';

export default App.ImageReviewModel = Ember.Object.extend({
    sessionId: 0,
	images: []
});

App.ImageReviewModel.reopenClass({
    /**
     * @returns {Ember.RSVP.Promise} model
     */
    startSession() {
        console.log('ImageReviewModel.startSession() with userId '+M.prop('userId'));
        return new Ember.RSVP.Promise((resolve, reject) => {
            Ember.$.ajax({
                url: App.ImageReviewModel.getServiceUrl(),
				dataType: 'json',
				method: 'POST',
				xhrFields: {
					withCredentials: true
				},
                success: (data) => {
					resolve(App.ImageReviewModel.getImages(data.id));
					console.log('Startsession success: '+JSON.stringify(data));
                },
                error: (data) => {
                    reject(data);
                }
            });
        });
    },

    endSession() {
        console.log('ImageReviewModel.endSession()');
        return new Ember.RSVP.Promise((resolve, reject) => {
			Ember.$.ajax({
				url: App.ImageReviewModel.getServiceUrl(),
				xhrFields: {
					withCredentials: true
				},
				dataType: 'json',
				method: 'DELETE',
                success: (data) => {
					resolve(data);
                },
                error: (data) => {
                    reject(data);
                }
            });
        });
    },
    getImages(sessionId) {
        return new Ember.RSVP.Promise((resolve, reject) => {
			Ember.$.ajax({
				url: App.ImageReviewModel.getServiceUrl() + sessionId + '/image',
				xhrFields: {
					withCredentials: true
				},
				dataType: 'json',
				method: 'GET',
				success: (data) => {
					console.log("GetImages data: "+JSON.stringify(data));
					if (Ember.isArray(data)) {
						resolve(App.ImageReviewModel.sanitize(data, sessionId));
					} else {
						reject('Invalid data was returned from Image Review API');
					}
				},
				error: (data) => {
					reject(data);
				}
			});
        });
    },
    reviewImage(sessionId, imageId, reviewStatus) {
        console.log('ImageReviewModel.reviewImage()');
        return new Ember.RSVP.Promise((resolve, reject) => {
			Ember.$.ajax({
				url: App.ImageReviewModel.getServiceUrl() +
												sessionId + '/image/' + imageId + '?status=' + reviewStatus,
				xhrFields: {
					withCredentials: true
				},
				dataType: 'json',
				method: 'PUT',
				success: (data) => {
					resolve(data);
				},
				error: (data) => {
					reject(data);
				}
			});
        });
    },

	sanitize(rawData, sessionId) {
		var images = [];

		if (rawData.length) {
			rawData.forEach((image) => {
				if (image.reviewStatus === 'UNREVIEWED') {
					images.push({
                        imageId: image.imageId,
                        contractId: sessionId
                    });
				}
				//else skip because is reviewed already
			});
		}

		return App.ImageReviewModel.create({
			images: images,
            sessionId: sessionId
		});
	},

	setImageAsQuestionable(imageId) {
		console.log("Route.setImageAsQuestionable: "+imageId);
	},

	getServiceUrl() {
		return "https://services-poz.wikia-dev.com/image-review/contract/"
	}
});
