/// <reference path="../../typings/bluebird/bluebird.d.ts" />
/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/wreck/wreck.d.ts" />

/**
 * @description Mediawiki API functions
 */

import localSettings = require('../../config/localSettings');
import Wreck = require('wreck');
import Promise = require('bluebird');


/**
 * @desc wrapper class for making API search requests
 */
export class SearchRequest {
	name: string;

	constructor (params: {name: string}) {
		this.name = params.name;
	}

	/**
	 * @desc Default parameters to make the request url clean -- we may
	 * want to customize later
	 */
	searchForQuery (query: string) {
		var url = createUrl(this.name, 'api/v1/Search/List', {
			limit: 25,
			minArticleQuality: 10,
			namespaces: '0,14',
			query: query
		});
		return fetch(url);
	}
}

/**
 * @desc a wrapper for making API requests for info about the wiki
 *
 */
export class WikiRequest {
	name: string;

	constructor (params: {name: string}) {
		this.name = params.name;
	}

	getWikiVariables () {
		var url = createUrl(this.name, 'api/v1/Mercury/WikiVariables');

		return fetch(url);
	}
}

export class ArticleRequest {
	name: string;
	title: string;

	constructor (params: {name: string; title?: string}) {
		this.name = params.name;
		this.title = params.title;
	}

	fetch () {
		var url = createUrl(this.name, 'api/v1/Mercury/Article', {
			title: this.title
		});

		return fetch(url);
	}

	comments (articleId: number, page: number = 1) {
		var url: string = createUrl(this.name, 'api/v1/Mercury/ArticleComments', {
			id: articleId.toString(),
			page: page.toString()
		});

		return fetch(url);
	}
}

/**
 * @param url the url to fetch
 * @param redirects the number of redirects to follow, default 1
 */
export function fetch (url: string, redirects: number = 1): Promise<any> {
	return new Promise((resolve, reject) => {
		Wreck.get(url, {
			redirects: redirects,
			timeout:   10000 // timeout after 10 seconds
		}, (err: any, res: any, payload: any): void => {
			if (err) {
				reject(err);
			} else {
				if (res.headers['content-type'].match('application/json')) {
					payload = JSON.parse(payload);
				}

				resolve(payload);
			}
		});
	});
}

export function getDomainName(wikiSubDomain: string = ''): string {
	var environment: string = localSettings.environment,
		options: any = {
			production: '',
			preview: 'preview.',
			verify: 'verify.',
			sandbox: (localSettings.host + '.')
		};

	if (!environment) {
		throw Error('Environment not set');
	}

	if (wikiSubDomain) {
		wikiSubDomain = wikiSubDomain + '.';
	}

	if (typeof options[environment] !== 'undefined') {
		return 'http://' + options[environment] + wikiSubDomain + 'wikia.com/';
	}
	// Devbox
	return 'http://' + wikiSubDomain + localSettings.mediawikiHost + '.wikia-dev.com/';
}

export function createUrl(wikiSubDomain: string, path: string, params: any = {}): string {
	var qsAggregator: string[] = [];

	Object.keys(params).forEach(function(key) {
		qsAggregator.push(key + '=' + encodeURIComponent(params[key]));
	});

	return getDomainName(wikiSubDomain) +
		path +
		(qsAggregator.length > 0 ? '?' + qsAggregator.join('&') : '');
}
