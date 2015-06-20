/// <reference path="../../../typings/hapi/hapi.d.ts" />
var Utils = require('../../lib/Utils');
var localSettings = require('../../../config/localSettings');
/**
 * Prepares article data to be rendered
 * TODO: clean up this function
 *
 * @param {Hapi.Request} request
 * @param result
 */
function prepareArticleData(request, result) {
    var title, articleDetails, userDir = 'ltr';
    if (result.article.details) {
        articleDetails = result.article.details;
        title = articleDetails.cleanTitle ? articleDetails.cleanTitle : articleDetails.title;
    }
    else if (request.params.title) {
        title = request.params.title.replace(/_/g, ' ');
    }
    else {
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
    result.displayTitle = title;
    result.isMainPage = (title === result.wiki.mainPageTitle.replace(/_/g, ' '));
    result.canonicalUrl = result.wiki.basePath + result.wiki.articlePath + title.replace(/ /g, '_');
    result.themeColor = Utils.getVerticalColor(localSettings, result.wiki.vertical);
    // the second argument is a whitelist of acceptable parameter names
    result.queryParams = Utils.parseQueryParams(request.query, ['noexternals']);
    result.weppyConfig = localSettings.weppy;
    result.userId = request.state.wikicitiesUserID ? request.state.wikicitiesUserID : 0;
}
module.exports = prepareArticleData;
