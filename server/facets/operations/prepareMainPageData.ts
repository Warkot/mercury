/// <reference path="../../../typings/hapi/hapi.d.ts" />

import Utils = require('../../lib/Utils');
import localSettings = require('../../../config/localSettings');

/**
 * Prepares main page data to be rendered
 * @TODO CONCF-761 - part after prepareData is common for Main Page and article
 * - should be moved to some common piece of code.
 * @param {Hapi.Request} request
 * @param result
 */
function prepareMainPageData (request: Hapi.Request, result: any): void {
	var title: string,
		articleDetails: any,
		userDir = 'ltr';

	if (result.article.details) {
		articleDetails = result.article.details;
		title = articleDetails.cleanTitle ? articleDetails.cleanTitle : articleDetails.title;
	} else if (request.params.title) {
		title = request.params.title.replace(/_/g, ' ');
	} else {
		title = result.wiki.mainPageTitle.replace(/_/g, ' ');
	}

	if (result.article.article) {
		// we want to return the article content only once - as HTML and not JS variable
		result.articleContent = result.article.article.content;
		delete result.article.article.content;
	}

	if (result.wiki.language) {
		userDir = result.wiki.language.userDir;
		result.isRtl = (userDir === 'rtl');
	}

	result.mainPageData = {};
	result.mainPageData.adsContext = result.article.adsContext;
	result.mainPageData.ns = result.article.details.ns;

	result.displayTitle = title;
	result.isMainPage = (title === result.wiki.mainPageTitle.replace(/_/g, ' '));
	result.canonicalUrl = result.wiki.basePath + result.wiki.articlePath + title.replace(/ /g, '_');
	result.themeColor = Utils.getVerticalColor(localSettings, result.wiki.vertical);
	// the second argument is a whitelist of acceptable parameter names
	result.queryParams = Utils.parseQueryParams(request.query, ['noexternals', 'buckysampling']);

	result.weppyConfig = localSettings.weppy;
	if (typeof result.queryParams.buckySampling === 'number') {
		result.weppyConfig.samplingRate = result.queryParams.buckySampling / 100;
	}

	result.userId = request.auth.isAuthenticated ? request.auth.credentials.userId : 0;

	delete result.adsContext;
}

export = prepareMainPageData;
