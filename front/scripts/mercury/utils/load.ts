/// <reference path="../../baseline/mercury.d.ts" />
'use strict';

declare var $script: Function;

/**
 * This module is an alias for whatever script loader implementation we are using.
 * Use this stub to normalize/expose the features available to Wikia
 * developers and also to allow for swapping implementations in the future.
 */
module Mercury.Utils {
	/**
	 * @param {*[]} params
	 * @returns {*}
	 */
	export function load (...params: any[]) {
		return $script.apply(null, params);
	}
}