/**
 * @typedef {Object} UserModelFindParams
 * @property {number} userId
 * @property {number} [avatarSize]
 */

/**
 * @typedef {Object} UserProperties
 * @property {string} avatarPath
 * @property {string} name
 * @property {string} profileUrl
 * @property {number} userId
 */

App.UserModel = Em.Object.extend({
	avatarPath: null,
	name: null,
	userId: null,
	rights: null
});

App.UserModel.reopenClass({
	defaultAvatarSize: 100,

	/**
	 * @param {UserModelFindParams} params
	 * @returns {Ember.RSVP.Promise<App.UserModel>}
	 */
	find(params) {
		const avatarSize = params.avatarSize || App.UserModel.defaultAvatarSize,
			modelInstance = App.UserModel.create();

		return App.UserModel.loadDetails(params.userId, avatarSize)
			.then((userDetails) => {
				const detailsSanitized = App.UserModel.sanitizeDetails(userDetails);

				return modelInstance.setProperties(detailsSanitized);
			});
	},

	/**
	 * @param {number} userId
	 * @param {number} avatarSize
	 * @returns {Em.RSVP.Promise}
	 */
	loadDetails(userId, avatarSize) {
		return new Em.RSVP.Promise((resolve, reject) => {
			Em.$.ajax({
				url: M.buildUrl({
					path: '/wikia.php',
				}),
				data: {
					controller: 'UserApi',
					method: 'getDetails',
					ids: userId,
					size: avatarSize
				},
				dataType: 'json',
				success: (result) => {
					if (Em.isArray(result.items)) {
						resolve(result.items[0]);
					} else {
						reject(result);
					}
				},
				error: reject
			});
		});
	},

	/**
	 * @param {*} userData
	 * @returns {UserProperties}
	 */
	sanitizeDetails(userData) {
		return {
			name: userData.name,
			userId: userData.user_id,
			avatarPath: userData.avatar,
			profileUrl: M.buildUrl({
				namespace: 'User',
				title: userData.name
			})
		};
	}
});

