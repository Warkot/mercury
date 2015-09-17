class AuthUtils {

	public static authSuccessCallback (url?: string): void {
		if (window.parent && pageParams.parentOrigin) {
			window.parent.postMessage({isUserAuthorized: true}, pageParams.parentOrigin);
			return;
		} else if (url) {
			window.location.href = url;
			return;
		}

		window.location.reload();
	}

	public static loadUrl (url?: string): void {
		var win: Window;

		win = (pageParams.isModal ? window.parent : window);

		if (url) {
			win.location.href = url;
			return
		}

		win.location.reload();
	}
}