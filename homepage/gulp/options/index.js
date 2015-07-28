/*
	Load appropriate options object based on environment
 */

var environment = require('../../../gulp/utils/environment.js').name;

try {
	module.exports = require('./' + environment);
} catch (exception) {
	console.error('Options for given environment (' + environment + ') not found');
	throw new Error(exception);
}
