/**
 * Wikia (Japan) Homepage
 *
 * @author Per Johan Groland <pgroland@wikia-inc.com>
 */

'use strict';

var util = require('../util'),
	heroSliderConfig = util.readJsonConfigSync('static/hero_slider.json'),
	sliderConfig = util.readJsonConfigSync('static/sliders.json');

function index(request, reply) {
	var locale = util.getUserLocale(request),
		data = {
			title: 'ウィキア・ジャパン',
			heroSlider: heroSliderConfig.data,
			sliders: sliderConfig.data,
		};

	util.renderWithGlobalData(request, reply, data, 'index');
}

module.exports = index;
