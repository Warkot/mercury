App.ApplicationController = Em.Controller.extend(App.AlertNotificationsMixin, {
	// This has to be here because we need to access media from ArticleController model to open
	// lightbox TODO: Should be refactored when decoupling article from application
	article: Em.inject.controller(),
	queryParams: ['file', 'map',
		{
			noAds: 'noads'
		},
		// TODO: should be on articles controller https://wikia-inc.atlassian.net/browse/HG-815
		{
			commentsPage: 'comments_page'
		}
	],
	file: null,
	map: null,
	noAds: '',
	commentsPage: null,

	smartBannerVisible: false,
	sideNavVisible: false,
	userMenuVisible: false,
	noScroll: false,
	fullPage: false,
	noMargins: false,
	lightboxType: null,
	lightboxModel: null,
	lightboxVisible: false,
	// Controls the appearance of the share-header component
	enableShareHeader: false,

	sideNavCollapsedObserver: Em.observer('sideNavVisible', function () {
		if (this.get('sideNavVisible')) {
			this.set('noScroll', true);
		} else {
			this.set('noScroll', false);
		}
	}),

	/**
	 * @returns {void}
	 */
	init() {
		this.setProperties({
			domain: Em.get(Mercury, 'wiki.dbName') || window.location.href.match(/^https?:\/\/(.*?)\./)[1],
			language: Em.get(Mercury, 'wiki.language'),
			editorPreview: Em.get(Mercury, 'article.preview')
		});

		// This event is for tracking mobile sessions between Mercury and WikiaMobile
		M.track({
			action: M.trackActions.impression,
			category: 'app',
			label: 'load'
		});

		this._super();
	},

	actions: {
		/**
		 * Resets properties related to lightbox which causes it to close. Also unblocks scrolling.
		 *
		 * @returns {void}
		 */
		closeLightbox() {
			this.setProperties({
				lightboxModel: null,
				lightboxType: null,
				lightboxVisible: false,
				file: null,
				map: null,
				noScroll: false
			});
		},

		/**
		 * Sets lightbox type and model but doesn't show it. This method is used by Ads Module to
		 * prevent showing lightbox when there is no ad to display.
		 *
		 * @param {string} lightboxType
		 * @param {Object} [lightboxModel]
		 * @returns {void}
		 */
		createHiddenLightbox(lightboxType, lightboxModel) {
			this.setProperties({
				lightboxModel,
				lightboxType,
				lightboxVisible: false,
				noScroll: false
			});
		},

		/**
		 * Bubbles up to ApplicationRoute
		 *
		 * @param {HTMLAnchorElement} target
		 * @returns {void}
		 */
		handleLink(target) {
			this.get('target').send('handleLink', target);
		},

		/**
		 * Handles query params that should open a lightbox.
		 * If you add another param to the app you should modify this function.
		 *
		 * @returns {void}
		 */
		handleLightbox() {
			const file = this.get('file'),
				map = this.get('map');

			if (!Em.isEmpty(file)) {
				this.openLightboxForMedia(file);
			} else if (!Em.isEmpty(map)) {
				this.openLightboxForMap(map);
			}
		},

		/**
		 * Bubbles up to ApplicationRoute
		 *
		 * @returns {void}
		 */
		loadRandomArticle() {
			this.get('target').send('loadRandomArticle');
		},

		/**
		 * Sets controller properties that are passed to LightboxWrapperComponent.
		 * Also blocks scrolling.
		 *
		 * @param {string} lightboxType
		 * @param {Object} [lightboxModel]
		 * @returns {void}
		 */
		openLightbox(lightboxType, lightboxModel) {
			this.setProperties({
				lightboxModel,
				lightboxType,
				lightboxVisible: true,
				noScroll: true
			});
		},

		/**
		 * Bubbles up to ApplicationRoute
		 *
		 * @param {string} searchString
		 * @returns {void}
		 */
		search(searchString) {
			this.get('target').send('search', searchString);
		},

		/**
		 * Sets query param with given name to given value. Uses whitelist.
		 *
		 * @param {string} name
		 * @param {*} value
		 * @returns {void}
		 */
		setQueryParam(name, value) {
			const queryParamsWhitelist = ['file', 'map'];

			if (queryParamsWhitelist.indexOf(name) === -1) {
				Em.Logger.error('Something tried to set query param that is not on the whitelist', {
					name,
					value,
					whitelist: queryParamsWhitelist
				});
				return;
			}

			this.set(name, value);
		},

		/**
		 * Sets lightbox visibility to true. If you use openLightbox with lightboxVisible=false
		 * you can use this method to lightbox.
		 *
		 * @returns {void}
		 */
		showLightbox() {
			this.setProperties({
				lightboxVisible: true,
				noScroll: true
			});
		},

		/**
		 * @param {boolean} visible
		 * @returns {void}
		 */
		toggleSideNav(visible) {
			this.set('sideNavVisible', visible);
		},

		/**
		 * @param {boolean} visible
		 * @returns {void}
		 */
		toggleSmartBanner(visible) {
			this.set('smartBannerVisible', visible);
		},

		/**
		 * @param {boolean} visible
		 * @returns {void}
		 */
		toggleUserMenu(visible) {
			this.set('userMenuVisible', visible);
		}
	},

	/**
	 * Finds media in article model by the file query param and sends proper data to
	 * openLightbox action.
	 * TODO: It currently opens the first found image with the given title (file qp),
	 * TODO: we should improve it some day.
	 *
	 * @param {string} file
	 * @returns {void}
	 */
	openLightboxForMedia(file) {
		const mediaModel = this.get('article.model.media'),
			lightboxMediaRefs = mediaModel instanceof App.MediaModel ?
				mediaModel.getRefsForLightboxByTitle(file) :
				null;

		if (!Em.isEmpty(lightboxMediaRefs)) {
			this.send('openLightbox', 'media', {
				media: mediaModel,
				mediaRef: lightboxMediaRefs.mediaRef,
				galleryRef: lightboxMediaRefs.galleryRef
			});
		} else {
			// If we can't display the lightbox let's remove this param from the URL
			this.set('file', null);
		}
	},

	/**
	 * Find the map element in DOM by given map id and sends proper data to openLightbox action.
	 *
	 * @param {string} map
	 * @returns {void}
	 */
	openLightboxForMap(map) {
		const $map = Em.$(`a[data-map-id=${map}]`);

		this.send('openLightbox', 'map', {
			title: $map.data('map-title'),
			url: $map.data('map-url'),
			id: $map.data('map-id')
		});
	}
});