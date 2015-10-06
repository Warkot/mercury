/**
 * Wikia (Japan) Homepage
 *
 * @author Per Johan Groland <pgroland@wikia-inc.com>
 */

var Promise = require('bluebird'),
	request = require('request'),
	localSettings = require('../config/localSettings').localSettings;

function Auth() {
	function appendSlash(str) {
		if (str.charAt(str.length - 1) !== '/') {
			str += '/';
		}
		return str;
	}

	this.baseUrl = appendSlash(localSettings.helios.host);
	this.servicesUrl = appendSlash(localSettings.servicesUrl);
	this.apiUrl = appendSlash(localSettings.apiUrl);
}

function requestWrapper(url) {
	var deferred = Promise.defer();

	request.get(url, function (err, response, body) {
		if (err) {
			deferred.reject(err);
		} else {
			try {
				var json = JSON.parse(body);

				if (json.error) {
					deferred.reject(json);
				} else {
					deferred.resolve(json);
				}
			}
			catch (e) {
				deferred.resolve(body);
			}
		}
	});

	return deferred.promise;
}

Auth.prototype.login = function (username, password) {
	var url = this.baseUrl + 'token?' +
		'username=' + username + '&' +
		'password=' + password;

	return requestWrapper(url);
};

Auth.prototype.info = function (token) {
	var url = this.baseUrl + 'info?' +
		'code=' + token + '&noblockcheck=1';

	return requestWrapper(url);
};

Auth.prototype.getUserInfo = function (heliosInfoResponse) {
	var url = this.apiUrl + 'User/Details/?ids=' + heliosInfoResponse.user_id; // jshint ignore:line

	return requestWrapper(url);
};

Auth.prototype.getUserName = function (heliosInfoResponse) {
	var url = this.servicesUrl + 'user-attribute/user/' +
		heliosInfoResponse.user_id  + '/attr/username'; // jshint ignore:line

	return requestWrapper(url);
};

module.exports = Auth;
