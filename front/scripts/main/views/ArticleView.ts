/// <reference path="../app.ts" />
/// <reference path="../models/ArticleModel.ts" />
/// <reference path="../components/MediaComponent.ts" />
/// <reference path="../components/PortableInfoboxComponent.ts" />
/// <reference path="../components/WikiaMapComponent.ts" />
/// <reference path="../mixins/ViewportMixin.ts" />

'use strict';

interface HeadersFromDom {
	level: string;
	name: string;
	id?: string;
}

interface HTMLElement {
	scrollIntoViewIfNeeded: () => void
}

App.ArticleView = Em.View.extend(App.AdsMixin, App.LanguagesMixin, App.ViewportMixin, {
	classNames: ['article-wrapper'],
	noAds: Em.computed.alias('controller.noAds'),

	hammerOptions: {
		touchAction: 'auto',
		cssProps: {
			/**
			 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-touch-callout
			 * 'default' displays the callout
			 * 'none' disables the callout
			 * hammer.js sets it to 'none' by default so we have to override
			 */
			touchCallout: 'default'
		}
	},

	gestures: {
		swipeLeft: function (event: JQueryEventObject): void {
			// Track swipe events
			if ($(event.target).parents('.article-table').length) {

				M.track({
					action: M.trackActions.swipe,
					category: 'tables'
				});
			} else if ($(event.target).parents('.article-gallery').length) {
				M.track({
					action: M.trackActions.paginate,
					category: 'gallery',
					label: 'next'
				});
			}
		},

		swipeRight: function (event: JQueryEventObject): void {
			// Track swipe events
			if ($(event.target).parents('.article-gallery').length) {
				M.track({
					action: M.trackActions.paginate,
					category: 'gallery',
					label: 'previous'
				});
			}
		}
	},

	contributionFeatureEnabled: Em.computed('controller.model.isMainPage', function (): boolean {
		return !this.get('controller.model.isMainPage') && this.get('isJapaneseWikia');
	}),

	onModelChange: Em.observer('controller.model.article', function (): void {
		// This check is here because this observer will actually be called for views wherein the state is actually
		// not valid, IE, the view is in the process of preRender
		this.scheduleArticleTransforms();
	}),

	modelObserver: Em.observer('controller.model', function (): void {
		var model = this.get('controller.model');

		if (model) {
			document.title = model.get('cleanTitle') + ' - ' + Mercury.wiki.siteName;
			$('meta[name="description"]').attr('content', (typeof model.get('description') === 'undefined') ? '' : model.get('description'));
		}
	}),

	/**
	 * willInsertElement
	 * @description The article view is only inserted once, and then refreshed on new models. Use this hook to bind
	 * events for DOM manipulation
	 */
	willInsertElement: function (): void {
		this.scheduleArticleTransforms();
	},

	didInsertElement: function (): void {
		this.get('controller').send('articleRendered');
	},

	/**
	 * @desc Handle clicks on media and bubble up to Application if anything else was clicked
	 *
	 * @param event
	 * @returns {boolean}
	 */
	click: function (event: MouseEvent): boolean {
		var $anchor = Em.$(event.target).closest('a'),
			target: EventTarget;

		// Here, we want to handle media only, no links
		if ($anchor.length === 0) {
			target = event.target;

			if (this.shouldHandleMedia(target, target.tagName.toLowerCase())) {
				this.handleMedia(<HTMLElement>target);
				event.preventDefault();

				// Don't bubble up
				return false;
			}
		}

		// Bubble up to ApplicationView#click
		return true;
	},

	scheduleArticleTransforms: function (): void {
		Em.run.scheduleOnce('afterRender', this, this.articleContentObserver);
	},

	articleContentObserver: function (): boolean {
		if (this.get('_state') !== 'inDOM') {
			return false;
		}

		var model = this.get('controller.model'),
			article = model.get('article');

		if (article && article.length > 0) {
			if (this.get('contributionFeatureEnabled')) {
				this.setupContributionButtons();
			}

			this.loadTableOfContentsData();
			this.handleInfoboxes();
			this.replaceInfoboxesWithInfoboxComponents();
			this.replaceMediaPlaceholdersWithMediaComponents(model.get('media'), 4);
			Ember.run.later(this, () => { this.replaceMediaPlaceholdersWithMediaComponents(model.get('media')) }, 0);
			this.handleTables();
			this.replaceMapsWithMapComponents();
			this.handlePollDaddy();
			this.injectAds();
			this.setupAdsContext(model.get('adsContext'));

			M.setTrackContext({
				a: model.title,
				n: model.ns
			});

			M.trackPageView(model.get('adsContext.targeting'));
		}

		return true;
	},

	createMediaComponent: function (element: HTMLElement, model: typeof App.ArticleModel): JQuery {
		var ref = parseInt(element.dataset.ref, 10),
			media = model.find(ref);

		var component = this.createChildView(App.MediaComponent.newFromMedia(media), {
			ref: ref,
			width: parseInt(element.getAttribute('width'), 10),
			height: parseInt(element.getAttribute('height'), 10),
			imgWidth: element.offsetWidth,
			media: media
		}).createElement();

		return component.$().attr('data-ref', ref);
	},

	replaceMediaPlaceholdersWithMediaComponents: function (model: typeof App.ArticleModel, numberToProcess:number = -1): void {
		var $mediaPlaceholders = this.$('.article-media'),
			index: number;

		if (numberToProcess < 0 || numberToProcess > $mediaPlaceholders.length) {
			numberToProcess = $mediaPlaceholders.length;
		}

		for (index = 0; index < numberToProcess; index++) {
		    $mediaPlaceholders.eq(index).replaceWith(this.createMediaComponent($mediaPlaceholders[index], model));
		}
	},

	setupContributionButtons: function (): void {
		// TODO: There should be a helper for generating this HTML
		var pencil = '<div class="edit-section"><svg class="icon pencil" role="img"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pencil"></use></svg></div>',
		    photo = '<div class="upload-photo"><svg class="icon camera" role="img"><use xlink:href="#camera"></use></svg><input class="file-input" type="file" accept="image/*" capture="camera"/></div>',
		    iconsWrapper = '<div class="icon-wrapper">' + pencil + photo + '</div>',
		    $photoZero = this.$('.upload-photo');

		$photoZero
			.on('change', () => {
				this.onPhotoIconChange($photoZero, 0);
			})
			.on('click', () => {
				M.track({
					action: M.trackActions.click,
					category: 'sectioneditor',
					label: 'addPhoto',
					value: 0
				});
			});

		this.$(':header[section]').each((i: Number, item: any): void => {
			var $sectionHeader = this.$(item);
			$sectionHeader.prepend(iconsWrapper).addClass('short-header');
		});
		this.setupButtonsListeners();
	},

	setupButtonsListeners: function () : void {
		this.$('.article-content')
			.on('click', '.pencil', (event: JQueryEventObject): void => {
				var $sectionHeader = $(event.target).closest(':header[section]');
				this.get('controller').send('edit', this.get('controller.model.cleanTitle'), $sectionHeader.attr('section'));
			})
			.on('click', '.upload-photo', (event: JQueryEventObject): void => {
				var $sectionHeader = $(event.target).closest(':header[section]'),
				    sectionIndex: number = parseInt($sectionHeader.attr('section'), 10);

				M.track({
					action: M.trackActions.click,
					category: 'sectioneditor',
					label: 'addPhoto',
					value: sectionIndex
				});
			})
			.on('change', '.upload-photo', (event: JQueryEventObject): void => {
				var $uploadPhotoContainer = $(event.target).parent(),
				    sectionIndex: number = parseInt($(event.target).closest(':header[section]').attr('section'), 10);
				this.onPhotoIconChange($uploadPhotoContainer, sectionIndex);
			});
	},

	onPhotoIconChange: function(uploadPhotoContainer: JQuery, sectionNumber: number): void {
		var photoData = (<HTMLInputElement>uploadPhotoContainer.find('.file-input')[0]).files[0];
		this.get('controller').send('addPhoto', this.get('controller.model.cleanTitle'), sectionNumber, photoData);
	},

	/**
	 * @desc Generates table of contents data based on h2 elements in the article
	 * TODO: Temporary solution for generating Table of Contents
	 * Ideally, we wouldn't be doing this as a post-processing step, but rather we would just get a JSON with
	 * ToC data from server and render view based on that.
	 */
	loadTableOfContentsData: function (): void {
		var headers: HeadersFromDom[] = this.$('h2[section]').map((i: number, elem: HTMLElement): HeadersFromDom => {
			if (elem.textContent) {
				return {
					level: elem.tagName,
					name: elem.textContent,
					id: elem.id
				};
			}
		}).toArray();
		this.get('controller').send('updateHeaders', headers);
	},

	replaceMapsWithMapComponents: function (): void {
		this.$('.wikia-interactive-map-thumbnail').map((i: number, elem: HTMLElement): void => {
			this.replaceMapWithMapComponent(elem);
		});
	},

	replaceMapWithMapComponent: function (elem: HTMLElement): void {
		var $mapPlaceholder = $(elem),
			$a = $mapPlaceholder.children('a'),
			$img = $a.children('img'),
			mapComponent: typeof App.WikiaMapComponent = this.createChildView(App.WikiaMapComponent.create({
				url: $a.data('map-url'),
				imageSrc: $img.data('src'),
				id: $a.data('map-id'),
				title: $a.data('map-title'),
				click: 'openLightbox'
			}));

		mapComponent.createElement();
		$mapPlaceholder.replaceWith(mapComponent.$());
		//TODO: do it in the nice way
		mapComponent.trigger('didInsertElement');
	},

	replaceInfoboxesWithInfoboxComponents: function (): void {
		this.$('.portable-infobox').map((i: number, elem: HTMLElement): void => {
			this.replaceInfoboxWithInfoboxComponent(elem);
		});
	},

	replaceInfoboxWithInfoboxComponent: function (elem: HTMLElement): void {
		var $infoboxPlaceholder = $(elem),
			infoboxComponent: typeof App.PortableInfoboxComponent;

		infoboxComponent = this.createChildView(App.PortableInfoboxComponent.create({
			infoboxHTML: elem.innerHTML,
			height: $infoboxPlaceholder.outerHeight()
		}));

		infoboxComponent.createElement();
		$infoboxPlaceholder.replaceWith(infoboxComponent.$());
		//TODO: do it in the nice way
		infoboxComponent.trigger('didInsertElement');
	},

	/**
	 * @desc handles expanding long tables, code taken from WikiaMobile
	 */
	handleInfoboxes: function (): void {
		var shortClass = 'short',
			$infoboxes = $('table[class*="infobox"] tbody'),
			body = window.document.body,
			scrollTo = body.scrollIntoViewIfNeeded || body.scrollIntoView;

		if ($infoboxes.length) {
			$infoboxes
				.filter(function (): boolean {
					return this.rows.length > 6;
				})
				.addClass(shortClass)
				.append('<tr class=infobox-expand><td colspan=2><svg viewBox="0 0 12 7" class="icon"><use xlink:href="#chevron"></use></svg></td></tr>')
				.on('click', function (event): void {
					var $target = $(event.target),
						$this = $(this);

					if (!$target.is('a') && $this.toggleClass(shortClass).hasClass(shortClass)) {
						scrollTo.apply($this.find('.infobox-expand')[0]);
					}
				});
		}
	},

	handleTables: function (): void {
		var $tables = $('table:not([class*=infobox], .dirbox)').not('table table'),
			wrapper: HTMLDivElement;

		if ($tables.length) {
			wrapper = document.createElement('div');
			wrapper.className = 'article-table';

			$tables
				.wrap(wrapper)
				.css('visibility', 'visible');
		}
	},

	/**
	 * This is a hack to make PollDaddy work (HG-618)
	 * @see http://static.polldaddy.com/p/8791040.js
	 */
	handlePollDaddy: function (): void {
		var $polls = this.$('script[src*=polldaddy]');

		$polls.each((index: number, script: HTMLScriptElement): void => {
			// extract ID from script src
			var idRegEx: RegExp = /(\d+)\.js$/,
				matches: any = script.src.match(idRegEx),
				id: string,
				html: string,
				init: any;

			// something is wrong with poll daddy or UCG.
			if (!matches || !matches[1]) {
				Em.Logger.error('Polldaddy script src url not recognized', script.src);
				return;
			}

			id = matches[1];
			init = window['PDV_go' + id];

			if (typeof init !== 'function') {
				Em.Logger.error('Polldaddy code changed', script.src);
				return;
			}

			// avoid PollDaddy's document.write on subsequent article loads
			if (!this.$('#PDI_container' + id).length) {
				html = '<a name="pd_a_' + id + '" style="display: inline; padding: 0px; margin: 0px;"></a>' +
					'<div class="PDS_Poll" id="PDI_container' + id + '"></div>';
				$(script).after(html);
			}
			init();
		});
	},

	/**
	 * @desc Returns true if handleMedia() should be executed
	 * @param {EventTarget} target
	 * @param {string} tagName clicked tag name
	 * @returns {boolean}
	 */
	shouldHandleMedia: function (target: EventTarget, tagName: string): boolean {
		return (tagName === 'img' || tagName === 'figure') && $(target).children('a').length === 0;
	},

	/**
	 * Opens media lightbox for given target
	 *
	 * @param target
	 */
	handleMedia: function (target: HTMLElement): void {
		var $target = $(target),
			galleryRef = $target.closest('[data-gallery-ref]').data('gallery-ref'),
			$mediaElement = $target.closest('[data-ref]'),
			mediaRef = $mediaElement.data('ref'),
			media: typeof App.MediaModel;

		if (mediaRef >= 0) {
			Em.Logger.debug('Handling media:', mediaRef, 'gallery:', galleryRef);

			if (!$mediaElement.hasClass('is-small')) {
				media = this.get('controller.model.media');
				this.get('controller').send('openLightbox', 'media', {
					media: media,
					mediaRef: mediaRef,
					galleryRef: galleryRef
				});
			} else {
				Em.Logger.debug('Image too small to open in lightbox', target);
			}

			if (galleryRef >= 0) {
				M.track({
					action: M.trackActions.click,
					category: 'gallery'
				});
			}
		} else {
			Em.Logger.debug('Missing ref on', target);
		}
	}
});
