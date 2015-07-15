/// <reference path="../../typings/hapi/hapi.d.ts" />
/// <reference path="../lib/Article.ts" />

import Article = require('../lib/Article');
import Utils = require('../lib/Utils');
import Tracking = require('../lib/Tracking');
import Caching = require('../lib/Caching');
import localSettings = require('../../config/localSettings');
import prepareArticleData = require('./operations/prepareArticleData');
import prepareMainPageData = require('./operations/prepareMainPageData');

var cachingTimes = {
	enabled: true,
	cachingPolicy: Caching.Policy.Public,
	varnishTTL: Caching.Interval.standard,
	browserTTL: Caching.Interval.disabled
};

function showArticle (request: Hapi.Request, reply: Hapi.Response): void {
	var path: string = request.path,
		wikiDomain: string = Utils.getCachedWikiDomainName(localSettings, request.headers.host),
		params: ArticleRequestParams = {
			wikiDomain: wikiDomain,
			redirect: request.query.redirect
		},
		article: Article.ArticleRequestHelper,
		allowCache = true;

	if (request.state.wikicities_session) {
		params.headers = {
			'Cookie': `wikicities_session=${request.state.wikicities_session}`
		};
		allowCache = false;
	}

	article = new Article.ArticleRequestHelper(params);

	if (path === '/' || path === '/wiki/') {
		article.getWikiVariables((error: any, wikiVariables: any) => {
			if (error) {
				// TODO check error.statusCode and react accordingly
				reply.redirect(localSettings.redirectUrlOnNoData);
			} else {
				article.setTitle(wikiVariables.mainPageTitle);
				article.getArticle(wikiVariables, (error: any, result: any = {}) => {
					onArticleResponse(request, reply, error, result, allowCache);
				});
			}
		});
	} else  {
		article.setTitle(request.params.title);
		article.getFull((error: any, result: any = {}) => {
			onArticleResponse(request, reply, error, result, allowCache);
		});
	}
}

/**
 * Handles article response from API
 *
 * @param {Hapi.Request} request
 * @param reply
 * @param error
 * @param result
 * @param allowCache
 */
function onArticleResponse (
	request: Hapi.Request,
	reply: any,
	error: any,
	result: any = {},
	allowCache: boolean = true): void {
		var code = 200,
			response: Hapi.Response;

		if (!result.article.details && !result.wiki.dbName) {
			//if we have nothing to show, redirect to our fallback wiki
			reply.redirect(localSettings.redirectUrlOnNoData);
		} else {
			Tracking.handleResponse(result, request);

			if (error) {
				code = error.code || error.statusCode || 500;
				result.error = JSON.stringify(error);
			}

			// @TODO CONCF-761 decouple logic for main page and article. Move common part to another file.
			if (result.article.isMainPage) {
				prepareMainPageData(request, result);
			} else {
				prepareArticleData(request, result);
			}

			// all the third party scripts we don't want to load on noexternals
			if (!result.queryParams.noexternals) {
				// optimizely
				if (localSettings.optimizely.enabled) {
					result.optimizelyScript = localSettings.optimizely.scriptPath +
						(localSettings.environment === Utils.Environment.Prod ?
							localSettings.optimizely.account : localSettings.optimizely.devAccount) + '.js';
				}

				// qualaroo
				if (localSettings.qualaroo.enabled) {
					result.qualarooScript = localSettings.environment === Utils.Environment.Prod ?
						localSettings.qualaroo.scriptUrlProd : localSettings.qualaroo.scriptUrlDev;
				}
			}

			response = reply.view('application', result);
			response.code(code);
			response.type('text/html; charset=utf-8');

			if (allowCache) {
				return Caching.setResponseCaching(response, cachingTimes);
			}
			return Caching.disableCache(response);
		}
}

export = showArticle;
