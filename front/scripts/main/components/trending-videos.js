import App from 'app';
import MediaModel from 'models/media';

App.TrendingVideosComponent = Ember.Component.extend({
	classNames: ['trending', 'trending-videos', 'mw-content'],

	actions: {
		/**
		 * @param {*} video
		 * @returns {void}
		 */
		openLightbox(video) {
			const mediaModel = MediaModel.create({
				media: video,
			});

			this.sendAction('openLightbox', 'media', {
				media: mediaModel,
				mediaRef: 0,
			});
		},
	},
});

export default App.TrendingVideosComponent;
