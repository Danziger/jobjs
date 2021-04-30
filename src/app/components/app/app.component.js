import './app.style.scss';
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';

import { Card } from '../card/card.component';
// import { Panel } from '../panel/panel.componen';

export class App {

    screenshotButton = document.getElementById('screenshotButton');
    errorBox = document.getElementById('errorBox');

    constructor() {
        this.screenshotButton.onclick = this.handleScreenshotClick = this.handleScreenshotClick.bind(this);

        this.card = new Card();
        // this.salaryPanel = new Panel();
    }

    handleScreenshotClick(e) {
        e.stopPropagation();

        this.errorBox.setAttribute('hidden', true);

        const isScreenshotModeEnabled = this.card.toggleScreenshotMode();

        if (isScreenshotModeEnabled) {
            this.screenshotButton.disabled = true;
            this.screenshotButton.innerText = 'Downloading...';

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
                this.screenshotButton.innerText = 'Download';
            });
        } else {
            // This should not happen, just here in case there's an error:
            this.screenshotButton.disabled = false;
            this.screenshotButton.innerText = 'Download';
        }

    }

}
