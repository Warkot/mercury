export default Ember.Component.extend({
	classNames: ['discussion-error-dialog'],
	isDialogVisible: false,
	modalDialogService: Ember.inject.service('modal-dialog'),

	actions: {
		/**
		 * @returns {void}
		 */
		close() {
			this.set('isDialogVisible', false);
			this.get('modalDialogService').close();
		}
	}
});