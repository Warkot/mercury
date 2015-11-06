/**
 * Helper to generate SVGs in the form:
 * {{svg name viewBox classes}}
 * <svg viewBox="{{viewBox}}" class="{{classes}}">
 *    <use xlink:href="#{{name}}"></use>
 * </svg>
 *
 * i.e., {{svg "chevron" "0 0 12 7" "icon chevron"}} generates:
 * <svg viewBox="0 0 12 7" class="icon chevron">
 *    <use xlink:href="#chevron"></use>
 * </svg>
 *
 * @param {Array} params
 * @param {Object} options
 * @returns {Em.Handlebars.SafeString}
 */
App.SvgHelper = Em.Helper.helper((params, options) => {
	const optionalParams = [
			'class',
			'role',
			'viewBox'
		],
		name = params[0];

	let ret = '<svg';

	optionalParams.forEach((param) => {
		if (param in options) {
			ret += ` ${param}="${options[param]}"`;
		}
	});
	ret += `><use xlink:href="#${name}"></use></svg>`;

	return new Em.Handlebars.SafeString(ret);
});
