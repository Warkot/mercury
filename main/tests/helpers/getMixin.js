import Ember from 'ember';

export default function getMixin(mixinName) {
	var mixin = mrequire('main/mixins/' + mixinName).default,
		classWithMixin = Ember.Object.extend(mixin);

	return classWithMixin.create({});
}
