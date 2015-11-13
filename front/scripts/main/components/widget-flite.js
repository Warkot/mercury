
import WidgetScriptStateMixin from '../mixins/widget-script-state';

const WidgetFliteComponent = Ember.Component.extend(
	WidgetScriptStateMixin,
	{
		classNames: ['widget-flite'],
		layoutName: 'components/widget-flite',
		data: null
	}
);

export default WidgetFliteComponent;