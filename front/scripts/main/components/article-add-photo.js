import App from 'app';
import {track as mercuryTrack, trackActions} from 'utils/track';

App.ArticleAddPhotoComponent = Ember.Component.extend({
	actions: {
		/**
		 * @returns {void}
		 */
		back() {
			this.sendAction('back');
			this.track('back');
		},

		/**
		 * @returns {void}
		 */
		upload() {
			this.sendAction('upload');
			this.track('upload');
		},
	},

	/**
	 * @param {string} label
	 * @returns {void}
	 */
	track(label) {
		mercuryTrack({
			action: trackActions.click,
			category: 'sectionaddphoto',
			label
		});
	},
});

export default App.ArticleAddPhotoComponent;
