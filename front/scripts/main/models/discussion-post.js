
import DiscussionErrorMixin from '../mixins/discussion-error';
import {buildUrl, getDiscussionServiceUrl} from '../../baseline/mercury/utils/buildUrl';

const DiscussionPostModel = Ember.Object.extend(DiscussionErrorMixin, {
	wikiId: null,
	postId: null,
	forumId: null,
	pivotId: null,
	replyLimit: 10,
	replies: [],
	firstPost: null,
	upvoteCount: 0,
	postCount: 0,
	page: 0,
	connectionError: null,
	notFoundError: null,
	contributors: [],

	/**
	 * @returns {Ember.RSVP.Promise}
	 */
	loadNextPage() {
		return new Ember.RSVP.Promise((resolve) => {
			Ember.$.ajax({
				url: getDiscussionServiceUrl(`/${this.wikiId}/threads/${this.postId}`, {
					responseGroup: 'full',
					sortDirection: 'descending',
					sortKey: 'creation_date',
					limit: this.replyLimit,
					pivot: this.pivotId,
					page: this.page + 1
				}),
				xhrFields: {
					withCredentials: true,
				},
				dataType: 'json',
				success: (data) => {
					let newReplies = data._embedded['doc:posts'];

					// Note that we have to reverse the list we get back because how we're displaying
					// replies on the page; we want to see the newest replies first but show them
					// starting with oldest of the current list at the top.
					newReplies.reverse();
					newReplies = newReplies.concat(this.replies);

					this.setProperties({
						replies: newReplies,
						page: this.page + 1
					});

					resolve(this);
				},
				error: (err) => {
					this.setErrorProperty(err, this);
					resolve(this);
				}
			});
		});
	}
});

DiscussionPostModel.reopenClass({
	/**
	 * @param {number} wikiId
	 * @param {number} postId
	 * @returns {Ember.RSVP.Promise}
	 */
	find(wikiId, postId) {
		return new Ember.RSVP.Promise((resolve) => {
			const postInstance = DiscussionPostModel.create({
				wikiId,
				postId
			});

			Ember.$.ajax({
				url: getDiscussionServiceUrl(`/${wikiId}/threads/${postId}`, {
					responseGroup: 'full',
					sortDirection: 'descending',
					sortKey: 'creation_date',
					limit: postInstance.replyLimit
				}),
				dataType: 'json',
				xhrFields: {
					withCredentials: true,
				},
				success: (data) => {
					const contributors = [],
						replies = data._embedded['doc:posts'];

					let pivotId;

					// If there are no replies to the first post, 'doc:posts' will not be returned
					if (replies) {
						pivotId = replies[0].id;
						// See note in previous reverse above on why this is necessary
						replies.reverse();

						replies.forEach((reply) => {
							if (reply.hasOwnProperty('createdBy')) {
								reply.createdBy.profileUrl = buildUrl({
									namespace: 'User',
									title: reply.createdBy.name
								});
								contributors.push(reply.createdBy);
							}
						});
					}

					postInstance.setProperties({
						contributors,
						forumId: data.forumId,
						replies,
						firstPost: data._embedded.firstPost[0],
						upvoteCount: data.upvoteCount,
						postCount: data.postCount,
						id: data.id,
						pivotId,
						page: 0,
						title: data.title
					});
					resolve(postInstance);
				},
				error: (err) => {
					postInstance.setErrorProperty(err, postInstance);
					resolve(postInstance);
				}
			});
		});
	}
});

export default DiscussionPostModel;