import './app.style.scss';
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';

import { Card } from '../card/card.component';
// import { Panel } from '../panel/panel.componen';

export class App {

    screenshotButton = document.getElementById('screenshotButton');

    constructor() {
        this.screenshotButton.onclick = this.handleScreenshotClick = this.handleScreenshotClick.bind(this);

        this.card = new Card();
        // this.salaryPanel = new Panel();
    }

    handleScreenshotClick(e) {
        e.stopPropagation();

        this.screenshotButton.innerText
            = this.card.toggleScreenshotMode() ? 'Edit' : 'Save';

        domtoimage.toBlob(document.getElementById('preview')).then(blob => saveAs(blob, 'my-node.png'));
    }

}
