/// <reference path="../../typings/hapi/hapi.d.ts" />
/// <reference path='../../typings/wreck/wreck.d.ts' />
/// <reference path='../../typings/boom/boom.d.ts' />

interface HeliosInfoResponse {
	'user_id': string;
	'error'?: string;
}

import Boom          = require('boom');
import qs            = require('querystring');
import Wreck         = require('wreck');
import localSettings = require('../../config/localSettings');
import Logger        = require('./Logger');
import authUtils     = require('./AuthUtils');

module HeliosSession {
	export function scheme (server: Hapi.Server, options: any): {authenticate: any} {
		return {
			authenticate: (request: any, reply: any): void => {
				var accessToken: string = request.state.access_token,
					callback = (err: any, response: any, payload: string): any => {
						var parsed: HeliosInfoResponse,
							parseError: Error;

						try {
							parsed = JSON.parse(payload);
						} catch (e) {
							parseError = e;
						}

						// Detects an error with the connection
						if (err || parseError) {
							Logger.error('Helios connection error: ', {
								err: err,
								parseError: parseError
							});
							return reply(Boom.unauthorized('Helios connection error'));
						}

						if (parsed.error) {
							reply.unstate('access_token');
							return reply(Boom.unauthorized('Token not authorized by Helios'));
						}
						return reply.continue({credentials: {userId: parsed.user_id}});
					};

				if (!accessToken) {
					return reply(Boom.unauthorized('No access_token'));
				}

				Wreck.get(
					authUtils.getHeliosUrl('/info?code=' + accessToken),
					callback
				);
			}
		};
	}
}

export = HeliosSession;
