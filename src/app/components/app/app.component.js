import './app.style.scss';
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';


import '../header/header.styles.scss';
import '../footer/footer.styles.scss';

import { Card } from '../card/card.component';

export class App {

    screenshotButton = document.getElementById('screenshotButton');
    screenshotButtonIcon = document.getElementById('screenshotButtonIcon');
    screenshotButtonText = document.getElementById('screenshotButtonText');
    errorBox = document.getElementById('errorBox');

    constructor() {
        this.screenshotButton.onclick = this.handleScreenshotClick = this.handleScreenshotClick.bind(this);

        this.card = new Card();
    }

    handleScreenshotClick(e) {
        e.stopPropagation();

        this.errorBox.setAttribute('hidden', true);

        const isScreenshotModeEnabled = this.card.toggleScreenshotMode();

        if (isScreenshotModeEnabled) {
            this.screenshotButton.disabled = true;
            this.screenshotButtonIcon.innerText = '📸';
            this.screenshotButtonText.style.width = `${ this.screenshotButtonText.offsetWidth }px`;
            this.screenshotButtonText.innerText = 'Saving...';

            domtoimage.toBlob(document.getElementById('preview')).then((blob) => {
                saveAs(blob, 'job-post-image.png');
            }).catch((err) => {
                // eslint-disable-next-line no-console
                console.error('Error while making the screenshot:', err);

                this.errorBox.removeAttribute('hidden');

                // TODO: It's possible to fallback to a base64-encoded PNG rendered on an <img> tag, so that users can
                // right click > Save as. See https://github.com/tsayen/dom-to-image.
            }).finally(() => {
                this.card.toggleScreenshotMode();

                this.screenshotButton.disabled = false;
                this.screenshotButtonIcon.innerText = '📷';
                this.screenshotButtonText.style.width = 'auto';
                this.screenshotButtonText.innerText = 'Save as Image';
            });
        } else {
            // This should not happen, just here in case there's an error:
            this.screenshotButton.disabled = false;
            this.screenshotButtonIcon.innerText = '📷';
            this.screenshotButtonText.style.width = 'auto';
            this.screenshotButtonText.innerText = 'Save as Image';
        }

    }

}
