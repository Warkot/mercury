/**
 * Wikia (Japan) Homepage
 *
 * @author Per Johan Groland <pgroland@wikia-inc.com>
 */

'use strict';

var util = require('../util'),
    hubConfig = util.readJsonConfigSync('static/hub_config.json'),
	popularItemConfig = util.readJsonConfigSync('static/popular.json');

function index(request, reply) {
	var locale = util.getUserLocale(request),
		data = {
			title: 'ウィキア・ジャパン',
			carousel: util.getLocalizedHubData(hubConfig, locale),
			popular: util.preprocessPopularData(popularItemConfig),
			prod: (process.env.WIKIA_ENVIRONMENT === 'prod'),
		};

	util.renderWithGlobalData(request, reply, data, 'index');
}

module.exports = index;
