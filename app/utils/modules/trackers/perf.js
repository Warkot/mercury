export class Perf extends BaseTracker {
	tracker;
	defaultContext;

	static checkDependencies () {
		return typeof Weppy === 'function';
	}

	constructor () {
		super();

		this.tracker = Weppy.namespace('mercury');

		this.defaultContext = {
			skin: 'mercury',
			'user-agent': window.navigator.userAgent,
			env: M.prop('environment'),
			url: window.location.href.split('#')[0]
		};

		this.tracker.setOptions({
			host: M.prop('weppyConfig').host,
			transport: 'url',
			context: this.defaultContext,
			sample: M.prop('weppyConfig').samplingRate,
			aggregationInterval: M.prop('weppyConfig').aggregationInterval
		});

	}

	track (params) {
		var trackFn = this.tracker;

		if (typeof params.module === 'string') {
			trackFn = this.tracker.into(params.module);
		}

		// always set the current URL as part of the context
		this.defaultContext.url = window.location.href.split('#')[0];

		// update context in Weppy with new URL and any explicitly passed overrides for context
		trackFn.setOptions({
			context: $.extend(params.context, this.defaultContext)
		});

		switch (params.type) {
			case 'count':
				trackFn.count(params.name, params.value, params.annotations);
				break;
			case 'store':
				trackFn.store(params.name, params.value, params.annotations);
				break;
			case 'timer':
				trackFn.timer.send(params.name, params.value, params.annotations);
				break;
			case undefined:
				throw 'You failed to specify a tracker type.';
				break;
			default:
				throw 'This action not supported in Weppy tracker';
		}

		trackFn.flush();
	}
}
