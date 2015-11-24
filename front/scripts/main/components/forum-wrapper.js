import App from '../app';
import DiscussionUpvoteActionSendMixin from '../mixins/discussion-upvote-action-send';

export default App.ForumWrapperComponent = Ember.Component.extend(
	DiscussionUpvoteActionSendMixin,
	{
		classNames: ['forum-wrapper', 'discussion', 'forum'],
		postsDisplayed: 0,
		totalPosts: 0,
		pageNum: null,
		currentlyLoadingPage: false,
		isLoading: true,

		hasMore: Ember.computed('totalPosts', 'postsDisplayed', function () {
			return this.get('totalPosts') > this.get('postsDisplayed');
		}),

		pageLoaded: Ember.observer('postsDisplayed', function () {
			this.set('currentlyLoadingPage', false);
		}),

		actions: {
			/**
			 * @param {number} postId
			 * @returns {void}
			 */
			goToPost(postId) {
				this.sendAction('goToPost', postId);
			},
		},

		/**
		 * @returns {void}
		 */
		didScroll() {
			if (this.get('hasMore') && !this.get('currentlyLoadingPage') && this.isScrolledToTrigger()) {
				this.setProperties({
					pageNum: this.pageNum + 1,
					currentlyLoadingPage: true,
				});
				this.sendAction('loadPage', this.pageNum);
			}
		},

		/**
		 * Check if scrolling should trigger fetching new posts
		 *
		 * @returns {boolean}
		 */
		isScrolledToTrigger() {
			const windowHeight = $(window).height(),
				triggerDistance = 0.25 * windowHeight,
				distanceToViewportTop = $(document).height() - windowHeight,
				viewPortTop = $(document).scrollTop();

			return distanceToViewportTop - viewPortTop < triggerDistance;
		},

		/**
		 * @returns {void}
		 */
		didInsertElement() {
			$(window).on('scroll', this.didScroll.bind(this));
		},

		/**
		 * @returns {void}
		 */
		willDestroyElement() {
			$(window).off('scroll', this.didScroll.bind(this));
		},
	}
);
