/// <reference path="../app.ts" />
/// <reference path="../../../../typings/ember/ember.d.ts" />

'use strict';

interface DataItem {
	data: {
		defaultValue: string;
		label: string;
	};
	infoboxBuilderData: {
		index: number;
		component: string;
	};
	source: string;
	type: string;
}

interface ImageItem {
	data: {
		alt: {
			source: string;
			data: {
				defaultValue: string;
			}
		};
		caption: {
			source: string;
			data: {
				defaultValue: string;
			}
		};
		defaultValue: string;
	};
	infoboxBuilderData: {
		index: number;
		component: string;
	};
	source: string;
	type: string;
}

interface TitleItem {
	data: {
		defaultValue: string;

	};
	infoboxBuilderData: {
		index: number;
		component: string;
	};
	source: string;
	type: string;
}

interface SaveStateToTemplateResponse {
	success: boolean;
	errors: any[];
	warnings: any[];
}

App.InfoboxBuilderModel = Em.Object.extend({
	_itemIndex: {
		data: 0,
		image: 0,
		title: 0,
	},
	infoboxState: Em.A([]),
	itemInEditMode: null,
	itemInEditModePosition: null,

	/**
	 * @desc add item to infobox state
	 * @param {DataItem|TitleItem|ImageItem} object
	 */
	addToState(object: DataItem|TitleItem|ImageItem): void {
		this.get('infoboxState').pushObject(object);
	},

	/**
	 * @desc add <data> item
	 * addItem's methods can be refactored when figure out
	 * stable version of infobox items and params
	 */
	addDataItem(): void {
		var itemType = 'data',
			i = this.increaseItemIndex('data');

		this.addToState({
			data: {
				defaultValue: `${i18n.t('app.infobox-builder-data-item-default-value')} ${i}`,
				label: `${i18n.t('app.infobox-builder-label-item-default-value')} ${i}`,
			},
			infoboxBuilderData: {
				index: i,
				component: this.createComponentName(itemType)
			},
			source: `data${i}`,
			type: itemType
		});
	},

	/**
	 * @desc add <image> item
	 * addItem's methods can be refactored when figure out
	 * stable version of infobox items and params
	 */
	addImageItem(): void {
		var itemType = 'image',
			i = this.increaseItemIndex(itemType);

		this.addToState({
			data: {
				alt: {
					source: `alt${i}`,
					data: {
						defaultValue: i18n.t('app.infobox-builder-alt-item-default-value'),
					}
				},
				caption: {
					source: `caption${i}`,
					data: {
						defaultValue: i18n.t('app.infobox-builder-caption-item-default-value'),
					}
				} ,
				defaultValue: 'path/to/image.jpg',
			},
			infoboxBuilderData: {
				index: i,
				component: this.createComponentName(itemType)
			},
			source: `image${i}`,
			type: itemType
		});
	},

	/**
	 * @desc add <title> item
	 * addItem's methods can be refactored when figure out
	 * stable version of infobox items and params
	 */
	addTitleItem(): void {
		var itemType = 'title',
			i = this.increaseItemIndex('title');

		this.addToState({
			data: {
				defaultValue: `${i18n.t('app.infobox-builder-title-item-default-value')} ${i}`,

			},
			infoboxBuilderData: {
				index: i,
				component: this.createComponentName(itemType)
			},
			source: `title${i}`,
			type: itemType
		});
	},

	/**
	 * @desc creates component name for given item type
	 * @param {String} type
	 * @returns {String}
	 */
	createComponentName(type: string): string {
		return `infobox-builder-item-${type}`;
	},

	/**
	 * @desc Prepares infobox state to be sent to API.
	 * The infoboxBuilderData part is needed only on
	 * client side so remove it and wrap result as data object of the main infobox tag
	 *
	 * @param {Em.Array} state
	 * @returns string stringified object
	 */
	prepareStateForSaving(state: Em.Array): string {
		var plainState = state.map((item: any) => {
			delete item.infoboxBuilderData;
			return item;
		}).toArray();

		return JSON.stringify({data: plainState});
	},

	/**
	 * @desc increase index for given item type
	 * @param {String} indexType
	 * @returns {Number}
	 */
	increaseItemIndex(indexType: string): number {
		return this.incrementProperty(`_itemIndex.${indexType}`);
	},

	/**
	 * @desc sets item to the edit mode
	 * @param {DataItem|ImageItem|TitleItem} item
	 * @param {Number} position
	 */
	setEditItem(item: DataItem|ImageItem|TitleItem, position: number): void {
		this.set('itemInEditMode', item);
		this.set('itemInEditModePosition', position);
	},

	/**
	 * @desc removes item from state for given position
	 * @param {Number} position
	 */
	removeItem(position: number): void {
		this.get('infoboxState').removeAt(position);
		this.resetEditMode();
	},

	/**
	 * @desc resets item in edit mode and its position to null
	 */
	resetEditMode(): void {
		this.set('itemInEditMode', null);
		this.set('itemInEditModePosition', null);
	},

	/**
	 * @desc setup infobox builder initial state
	 */
	setupInitialState(): void {
		this.addTitleItem();
		this.addImageItem();
		this.addDataItem();
	},

	/**
	 * @desc saves infobox state to MW template
	 * @returns {Em.RSVP.Promise}
	 */
	saveStateToTemplate(): Em.RSVP.Promise {
		return new Em.RSVP.Promise((resolve: Function, reject: Function): void => {
			Em.$.ajax(<JQueryAjaxSettings>{
				url: M.buildUrl({
					path: '/wikia.php'
				}),
				data: {
					controller: 'PortableInfoboxBuilderController',
					method: 'publish',
					title: this.get('title'),
					data: this.prepareStateForSaving(this.get('infoboxState'))
				},
				dataType: 'json',
				method: 'POST',
				success: (data: SaveStateToTemplateResponse): void => {
					if (data && data.success) {
						resolve(this.get('title'));
					} else {
						reject(data.errors);
					}
				},
				error: (err: any): void => {
					reject(err);
				}
			});
		});
	}
});
