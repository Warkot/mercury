/**
 * Dev localSettings for application
 *
 * var localConfig = require('./config').localSettings
 */
import baseLocalSettings = require('./localSettings.dev');
import Utils = require('../server/lib/Utils');

var localSettings = baseLocalSettings.getSettings({
	// Add custom settings here
});

export = localSettings;
