/**
 * @typedef {Object} ThumbnailOptions
 * @property {string} mode
 * @property {number} width
 * @property {number} [height]
 */

App.MediaComponent = Em.Component.extend(
	App.VisibleMixin,
	{
		tagName: 'figure',
		classNames: ['media-component'],

		width: null,
		height: null,
		ref: null,
		emptyGif: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAQAIBRAA7',
		visible: false,
		media: null,
		thumbnailer: Mercury.Modules.Thumbnailer,
		limitHeight: false,
		normalizeWidth: true,

		// thumb widths
		thumbSize: {
			small: 340,
			medium: 660,
			large: 900,
		},

		// icon width depends on it's real dimensions
		iconHeight: 20,
		iconWidth: Em.computed('media', 'iconHeight', function () {
			const media = this.get('media'),
				iconHeight = this.get('iconHeight');

			return Math.floor(iconHeight * media.width / media.height);
		}),

		/**
		 * caption for current media
		 */
		caption: Em.computed('media', {
			get() {
				const media = this.get('media');

				if (media && typeof media.caption === 'string') {
					return media.caption;
				}
			},
			set(key, value) {
				return value;
			},
		}),

		actions: {
			/**
			 * @returns {void}
			 */
			onVisible() {
				this.load();
			},

			/**
			 * @returns {void}
			 */
			clickLinkedImage() {
				M.track({
					action: M.trackActions.click,
					category: 'linked-image'
				});
			}
		},

		/**
		 * @param {number} width
		 * @returns {number}
		 */
		normalizeThumbWidth(width) {
			if (width <= this.thumbSize.small) {
				return this.thumbSize.small;
			} else if (width <= this.thumbSize.medium) {
				return this.thumbSize.medium;
			}

			return this.thumbSize.medium;
		},

		/**
		 * @param {string} url
		 * @param {ThumbnailOptions} options
		 * @returns {string}
		 */
		getThumbURL(url, options) {
			if (options.width &&
				options.mode === Mercury.Modules.Thumbnailer.mode.thumbnailDown &&
				this.get('normalizeWidth')
			) {
				options.width = this.normalizeThumbWidth(options.width);
			}

			// Sometimes width is null, so we need to make sure it has a value.
			options.width = options.width || this.thumbSize.small;

			if (!this.get('limitHeight')) {
				options.height = options.width;
			}

			url = this.thumbnailer.getThumbURL(url, options);

			return url;
		},
	}
);

App.MediaComponent.reopenClass({
	/**
	 * @param {ArticleMedia} media
	 * @returns {App.MediaComponent}
	 */
	newFromMedia(media) {
		if (media.context === 'infobox' || media.context === 'infobox-hero-image') {
			return App.InfoboxImageMediaComponent.create();
		} else if (Em.isArray(media)) {
			if (media.some((media) => Boolean(media.link))) {
				return App.LinkedGalleryMediaComponent.create();
			} else {
				return App.GalleryMediaComponent.create();
			}
		} else if (media.type === 'video') {
			return App.VideoMediaComponent.create();
		} else {
			return App.ImageMediaComponent.create();
		}
	},
});