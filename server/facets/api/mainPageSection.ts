/// <reference path="../../../typings/hapi/hapi.d.ts" />
/// <reference path="../../../typings/boom/boom.d.ts" />
import Boom = require('boom');
import Caching = require('../../lib/Caching');
import MW = require('../../lib/MediaWiki');
import Utils = require('../../lib/Utils');
import localSettings = require('../../../config/localSettings');
import wrapResult = require('./presenters/wrapResult');

interface CuratedContentSectionMW {
	items: {
		title: string;
		label: string;
		image_id: string;
		article_id: string;
		type: string;
		image_url: string;
		image_crop?: {
			landscape: {
				x: number;
				y: number;
				width: number;
				height: number;
			};
			square: {
				x: number;
				y: number;
				width: number;
				height: number;
			};
		};
		article_local_url: string
	};
}

var cachingTimes = {
	enabled: false,
	cachingPolicy: Caching.Policy.Private,
	varnishTTL: Caching.Interval.disabled,
	browserTTL: Caching.Interval.disabled
};

export function get (request: Hapi.Request, reply: any): void {
	var params = {
			wikiDomain: Utils.getCachedWikiDomainName(localSettings, request.headers.host),
			sectionName: decodeURIComponent(request.params.sectionName) || null
		};

	if (params.sectionName === null) {
		reply(Boom.badRequest('Section not provided'));
	} else {
		new MW.ArticleRequest(params)
			.curatedContentSection(params.sectionName)
			.then((response: any): void => {
				reply(response);
				Caching.setResponseCaching(response, cachingTimes);
			}, (error: any): void => {
				var wrappedResult = wrapResult(error, {});
				reply(wrappedResult).code(wrappedResult.status);
			});
	}
}
