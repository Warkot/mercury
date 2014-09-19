/// <reference path="../../../typings/jquery/jquery.d.ts" />
declare var $: JQueryStatic;
declare var require: (deps: string[], func: Function) => void;

declare module Wikia {
	var provide: (str: any, obj: any) => any;
	var _t: any;
	var language: string;
	var article: any;
	var _state: any;
	var error: any;
	var wiki: any;
	var ads: {
		slots: string[][];
	};

	module Modules {
		class VideoLoader {
			constructor(element: HTMLElement, params: any);
		}
		class VideoPlayer {}
	}

	module Utils {
	}
}

declare var W: any;

interface Location {
	origin: string;
}
