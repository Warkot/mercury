interface HeliosError {
	description: string;
	additional: HeliosErrorAdditional;
}

interface HeliosErrorAdditional {
	field: string;
}

interface HeliosRegisterInput {
	username: string;
	password: string;
	email: string;
	birthdate: string;
}

class SignupForm {
	form: HTMLFormElement;
	generalValidationErrors: Array<string> = ['email_blocked', 'username_unavailable', 'birthdate_below_min_age'];
	generalErrorShown: boolean = false;

	constructor(form: Element) {
		this.form = <HTMLFormElement> form;
	}

	private urlEncode(object: Object): string {
		return Object.keys(object).map((key: string) =>
				`${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`
		).join('&');
	}

	private clearValidationErrors(): void {
		var errorNodes: NodeList = this.form.querySelectorAll('.error');

		Array.prototype.forEach.call( errorNodes, (node: HTMLElement): void => {
			if (node.tagName === 'INPUT') {
				node.classList.remove('error');
			} else {
				node.parentNode.removeChild( node );
			}
		});
		this.generalErrorShown = false;
	}

	private displayValidationErrors(errors: Array<HeliosError>): void {
		Array.prototype.forEach.call( errors, (err: HeliosError): void => {
			if (this.generalValidationErrors.indexOf(err.description) === -1) {
				this.displayFieldValidationError(err);
			} else {
				this.displayGeneralError();
			}
		});
	}

	private displayFieldValidationError(err: HeliosError): void {
		var errorNode: HTMLElement = this.createValidationErrorHTMLNode(err.description),
			input: HTMLFormElement = <HTMLFormElement> this.form.elements[err.additional.field];
		input.parentNode.appendChild(errorNode);
		input.classList.add('error');
	}

	private displayGeneralError(): void {
		if (!this.generalErrorShown) {
			var errorNode: HTMLElement = this.createValidationErrorHTMLNode('registration_error');
			this.form.insertBefore(errorNode, document.getElementById('signupNewsletter').parentNode);
			this.generalErrorShown = true;
		}
	}

	private createValidationErrorHTMLNode(errorDescription: string): HTMLElement {
		var errorNode: HTMLElement = window.document.createElement('small');
		errorNode.classList.add('error');
		errorNode.appendChild(window.document.createTextNode(this.translateValidationError(errorDescription)));
		return errorNode;
	}

	private translateValidationError(errCode: string): string {
		return i18n.t('errors.' + errCode);
	}

	private onSubmit(event: Event): void {
		var xhr = new XMLHttpRequest(),
			formElements: HTMLCollection = this.form.elements,
			data: HeliosRegisterInput = {
				username: (<HTMLInputElement> formElements.namedItem('username')).value,
				password: (<HTMLInputElement> formElements.namedItem('password')).value,
				email: (<HTMLInputElement> formElements.namedItem('email')).value,
				birthdate: (<HTMLInputElement> formElements.namedItem('birthdate')).value
				// TODO add langCode
			},
			submitButton: HTMLElement = <HTMLElement> this.form.querySelector('button'),
			enableSubmitButton = () => {
				submitButton.disabled = false;
				submitButton.classList.remove('on');
			};

		submitButton.disabled = true;
		submitButton.classList.add('on');
		this.clearValidationErrors();

		xhr.onload = (e: Event) => {
			enableSubmitButton();

			if ((<XMLHttpRequest> e.target).status === 400) {
				this.displayValidationErrors(JSON.parse(xhr.responseText).errors);
			} else {
				alert('signed in correctly');
				// TODO handle successful registration
			}
		};

		xhr.onerror = (e: Event) => {
			enableSubmitButton();

			this.displayGeneralError();
		};

		xhr.open('POST', this.form.action, true);
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhr.send(this.urlEncode(data));

		event.preventDefault();
	}

	public watch(): void {
		this.form.addEventListener('submit', this.onSubmit.bind(this));
	}
}
