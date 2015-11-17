import BasePlayer from 'modules/VideoPlayers/Base';
import OoyalaPlayer from 'modules/VideoPlayers/Ooyala';
import YouTubePlayer from 'modules/VideoPlayers/YouTube';

const playerClassMap = {
	base: BasePlayer,
	ooyala: OoyalaPlayer,
	youtube: YouTubePlayer
};

/**
 * @class VideoLoader
 */
export default class VideoLoader {
	/**
	 * @param {*} data
	 * @returns {void}
	 */
	constructor(data) {
		this.data = data;
		this.loadPlayerClass();
	}

	/**
	 * @param {string} name
	 * @returns {boolean}
	 */
	isProvider(name) {
		return Boolean(this.data.provider.toLowerCase().match(name));
	}

	/**
	 * Loads player for the video, currently either OoyalaPlayer, YouTubePlayer or BasePlayer (default)
	 *
	 * @returns {void}
	 */
	loadPlayerClass() {
		const provider = this.getProviderName(),
			params = $.extend(this.data.jsParams, {
				size: {
					height: this.data.height,
					width: this.data.width
				}
			});

		this.player = new playerClassMap[provider](provider, params);
		this.player.onResize();
	}

	/**
	 * @returns {string}
	 */
	getProviderName() {
		return this.isProvider('ooyala') ? 'ooyala' : this.data.provider || 'base';
	}

	/**
	 * @returns {void}
	 */
	onResize() {
		this.player.onResize();
	}
}
