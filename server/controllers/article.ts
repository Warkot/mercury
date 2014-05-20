/// <reference path="../../definitions/hapi/hapi.d.ts" />
/**
 * @description Article controller
 */

import http = require('http');
import mediawiki = require('../lib/mediawiki');
import common = require('../lib/common');

/**
 * @description Handler for /article/{wiki}/{articleId} -- Currently calls to Wikia public JSON api for article:
 * http://www.wikia.com/api/v1/#!/Articles
 * This API is really not sufficient for semantic routes, so we'll need some what of retrieving articles by using the
 * article slug name
 */

interface ResponseData {
	wikiName: string;
	articleTitle: string;
	payload?: string;
	articleDetails?: any;
	comments?: any;
	relatedPages?: any;
	userDetails?: any;
}

/**
 * Gets article data
 *
 * @param {object} data
 * @returns {Q.Promise<*>}
 */
function getArticle(data: ResponseData): Q.Promise<any> {
	return common.promisify(function(deferred: Q.Deferred<any>) {
		mediawiki.article(data.wikiName, data.articleTitle)
			.then(function(article) {
				data.payload = article.body;
				deferred.resolve(data);
			})
			.catch(function(error) {
				deferred.reject(error);
			});
	});
}

function getArticleId(data: ResponseData): Q.Promise<any> {
	return common.promisify(function(deferred: Q.Deferred<any>){
		mediawiki.articleDetails(data.wikiName, [data.articleTitle])
			.then(function(articleDetails) {
				data.articleDetails = articleDetails.items[Object.keys(articleDetails.items)[0]];
				deferred.resolve(data);
			})
			.catch(function(error) {
				deferred.reject(error);
			});
	});
}

function getArticleComments(data: ResponseData): Q.Promise<any> {
	return common.promisify(function(deferred: Q.Deferred<any>){
		mediawiki.articleComments(data.wikiName, data.articleDetails.id)
			.then(function(articleComments) {
				data.comments = articleComments;
				deferred.resolve(data);
			})
			.catch(function(error) {
				deferred.reject(error);
			});
	});
}

function getRelatedPages(data: ResponseData): Q.Promise<any> {
	return common.promisify(function(deferred: Q.Deferred<any>){
		mediawiki.relatedPages(data.wikiName, [data.articleDetails.id])
			.then(function(relatedPages) {
				data.relatedPages = relatedPages;
				deferred.resolve(data);
			})
			.catch(function(error) {
				deferred.reject(error);
			});
	});
}

function getUserDetails(data: ResponseData): Q.Promise<any> {
	return common.promisify(function(deferred: Q.Deferred<any>){
		// todo: get top contributors list
		var userIds: number[] = [
			parseInt(data.articleDetails.revision.user_id, 10)
		];
		mediawiki.userDetails(data.wikiName, userIds)
			.then(function(userDetails) {
				data.userDetails = userDetails;
				deferred.resolve(data);
			})
			.catch(function(error) {
				deferred.reject(error);
			});
	});
}

export function handleRoute(request: Hapi.Request, reply: any): void {
	getArticle({
		wikiName: request.params.wiki,
		articleTitle: request.params.articleTitle
	})
	.then(getArticleId)
	.then(getRelatedPages)
	.then(getUserDetails)
	.then(function(response) {
		reply(response);
	})
	.catch(function(error) {
		reply(error);
	});
}
