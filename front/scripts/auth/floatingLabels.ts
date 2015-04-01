/**
 * Main entrypoint for validating user login
 */
class FloatingLabels {
	loginUsername: HTMLInputElement;
	loginPassword: HTMLInputElement;
	loginSubmit: HTMLButtonElement;

	constructor() {

	}

	private onFocus (event: Event): void {
		var element = <HTMLInputElement> event.target,
			nextElement = <HTMLElement> element.nextElementSibling,
			parentElement = <HTMLInputElement> element.parentElement;

		if (parentElement.className.match('input-container')) {
			nextElement.classList.add('active');
		}
	}

	private onBlur (input: Event): void {
		var element = <HTMLInputElement> event.target,
			nextElement = <HTMLElement> element.nextElementSibling,
			parentElement = <HTMLElement> element.parentElement;

		if (parentElement.className.match('input-container') && !element.value) {
			nextElement.classList.remove('active');
		}
	}

	/**
	 * Starts continuous checking for new input
	 */
	public watch (): void {
		window.document.querySelector('form')
			.addEventListener('focus', this.onFocus.bind(this), true);
		window.document.querySelector('form')
			.addEventListener('blur', this.onBlur.bind(this), true);
	}
}

window.document.addEventListener('DOMContentLoaded', function ():void {
	new FloatingLabels().watch();
});
