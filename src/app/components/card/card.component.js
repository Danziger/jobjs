import './card.style.scss';

function resizeTextarea(textarea) {
    const { style } = textarea;

    style.height = 'auto';

    window.requestAnimationFrame(() => {
        style.height = `${ Math.max(Math.ceil(textarea.scrollHeight / 8) * 8, 32) }px`;
    });
}

function sanitizeInput(input) {
    const { value } = input;
    const parsedValue = value.trim().replace(/\s+/g, ' ');

    if (value !== parsedValue) {
        input.value = parsedValue;
    }

    if (input.tagName === 'TEXTAREA') {
        resizeTextarea(input);
    }
}

const SCHEMA_VERSION = '1.0';

// const LS_DATA_KEY = 'LAST_JOB_DATA';

// eslint-disable-next-line max-len
const TRANSPARENT_PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2NgYGD4DwABBAEAcCBlCwAAAABJRU5ErkJggg==';

export class Card {

    static SIZE = 552;

    pasteTarget = null;
    focusTarget = null;

    locationPanel = null;
    salaryPanel = null;
    iconPanel = null;
    logoPanel = null;

    icons = Array.from(document.querySelectorAll('.card__icon'));
    inputs = Array.from(document.querySelectorAll('.card__inputText, .card__inputLine'));
    resizer = document.querySelector('.card__input--resizer');

    screenshotModeEnabled = false;

    data = {};

    constructor() {
        this.root = document.getElementById('root');
        this.cover = document.getElementById('cover');
        this.preview = document.getElementById('preview');
        this.additional = document.getElementById('additional');

        // Resize the card to keep image/text proportion:
        this.resizeCard();

        // Resize any textarea with multiline placeholders:
        Array.from(document.querySelectorAll('.card__inputText')).forEach(resizeTextarea);

        // For some reason, doing this a single time doesn't work well on iframes:
        setTimeout(() => {
            Array.from(document.querySelectorAll('.card__inputText')).forEach(resizeTextarea);
        }, 200);

        this.resizeCard = this.resizeCard.bind(this);

        window.onresize = this.handleResize = this.handleResize.bind(this);
        document.onkeydown = this.handleKeyDown = this.handleKeyDown.bind(this);
        document.oninput = this.handleInput = this.handleInput.bind(this);
        document.onchange = this.handleChange = this.handleChange.bind(this);
        document.onpaste = this.handlePaste = this.handlePaste.bind(this);
        document.ondrop = this.handleDrop = this.handleDrop.bind(this);
        document.onclick = this.handleClick = this.handleClick.bind(this);
    }

    save() {
        // TODO: Unfinished. Not doing anything yet:

        this.data = {
            version: SCHEMA_VERSION,
        };

        /*
        if (data) {
            try {
                localStorage.setItem(LS_DATA_KEY, JSON.stringify(data));
            } catch (err) {
                localStorage.removeItem(LS_DATA_KEY);
            }
        } else {
            localStorage.removeItem(LS_DATA_KEY);
        }
        */
    }

    toggleScreenshotMode() {
        if (this.screenshotModeEnabled) {
            this.disableScreenshotMode();
        } else {
            this.enableScreenshotMode();
        }

        return this.screenshotModeEnabled;
    }

    enableScreenshotMode() {
        this.screenshotModeEnabled = true;

        this.cover.removeAttribute('hidden');
        this.preview.removeAttribute('style');

        this.inputs.forEach((input) => {
            input.setAttribute('spellcheck', false);
            input.setAttribute('disabled', true);
        });

        this.icons.forEach((icon) => {
            icon.setAttribute('disabled', true);
        });

        const additionalPropsChildren = this.additional.children;
        const additionalPropsCount = additionalPropsChildren.length;
        const additionalPropsLastItem = additionalPropsChildren[additionalPropsCount - 1];

        additionalPropsLastItem.style.display = 'none';

        Array.from(additionalPropsChildren).forEach((li) => {
            const [icon, input] = li.children;

            icon.setAttribute('disabled', true);

            input.setAttribute('spellcheck', false);
            input.setAttribute('disabled', true);
        });
    }

    disableScreenshotMode() {
        this.screenshotModeEnabled = false;

        this.cover.setAttribute('hidden', true);
        this.resizeCard();

        this.inputs.forEach((input) => {
            input.setAttribute('spellcheck', true);
            input.removeAttribute('disabled');
        });

        this.icons.forEach((icon) => {
            icon.removeAttribute('disabled');
        });

        const additionalPropsChildren = this.additional.children;
        const additionalPropsCount = additionalPropsChildren.length;
        const additionalPropsLastItem = additionalPropsChildren[additionalPropsCount - 1];

        additionalPropsLastItem.removeAttribute('style');

        Array.from(additionalPropsChildren).forEach((li) => {
            const [icon, input] = li.children;

            icon.removeAttribute('disabled');

            input.setAttribute('spellcheck', true);
            input.removeAttribute('disabled');
        });
    }

    resizeCard() {
        const { root } = this;
        const { SIZE } = Card;

        // Scale to fit vertically and horizontally:
        this.preview.style.transform = `scale(${ Math.min(root.offsetWidth, root.offsetHeight, SIZE) / SIZE })`;

        // Scale to fit horizontally only:
        /*
        const scale = Math.min(root.offsetWidth, SIZE) / SIZE;
        const height = SIZE * scale;

        this.root.style.height = `${ height }px`;
        this.preview.style.transform = `scale(${ scale })`;
        */
    }

    checkInputs(input) {
        const li = input.parentElement;
        const ul = li.parentElement;

        if (ul.id === 'additional') {
            const isEmpty = !input.value;

            if (ul.lastElementChild === li && !isEmpty) {
                this.addInput(ul, li);
            } else if (ul.lastElementChild !== li && ul.children.length > 1 && isEmpty) {
                this.removeInput(ul, li);
            }
        }
    }

    addInput(ul, li) {
        const additionalPropsChildren = this.additional.children;
        const additionalPropsCount = additionalPropsChildren.length;
        const additionalPropsLastItem = additionalPropsChildren[additionalPropsCount - 1];
        const newItem = li.cloneNode(true);
        const newInput = newItem.querySelector('input, textarea');

        newInput.value = '';

        ul.appendChild(newItem);

        if (additionalPropsLastItem && additionalPropsLastItem.children[1] === document.activeElement) newInput.focus();

        this.save();
    }

    removeInput(ul, li) {
        try {
            li.remove();
        } catch (err) {
            // TODO: Fix this...
        }

        // TODO: Check if it contains the focus to move it!

        (this.focusTarget || ul.lastElementChild.querySelector('input, textarea')).focus();

        this.focusTarget = null;

        this.save();
    }

    handleResize() {
        window.requestAnimationFrame(this.resizeCard);
    }

    handleKeyDown(e) {
        const { key, keyCode } = e;
        const isEnter = key === 'Enter' || keyCode === 13;
        const isBackspaceOrDelete = key === 'Backspace' || keyCode === 8 || key === 'Backspace' || keyCode === 48;
        const isEmpty = e.target.value === '';

        if (isEnter || (isEmpty && isBackspaceOrDelete)) {
            e.preventDefault();

            this.checkInputs(e.target);
        }
    }

    handleInput({ target }) {
        if (this.pasteTarget === target) {
            sanitizeInput(target);
        } else if (target.tagName === 'TEXTAREA') {
            resizeTextarea(target);
        } else if (target.classList.contains('card__input--resizable')) {
            this.resizer.textContent = `${ target.value || target.placeholder }\u200c`;
            target.style.width = `${ this.resizer.offsetWidth }px`;
        }

        this.pasteTarget = null;

        this.save();
    }

    handleChange({ target }) {
        sanitizeInput(target);

        this.checkInputs(target);
    }

    handlePaste({ target }) {
        this.pasteTarget = target;
    }

    handleDrop({ target }) {
        const { tagName } = target;

        if (tagName === 'TEXTAREA' || tagName === 'INPUT') {
            this.pasteTarget = target;
        }
    }

    handleClick({ target }) {
        const { tagName } = target;

        if (tagName === 'TEXTAREA' || tagName === 'INPUT') {
            this.focusTarget = target;
        } else if (tagName === 'BUTTON') {
            if (target.children.length) {
                const img = target.children[0];

                // eslint-disable-next-line no-alert
                const rawImageSrc = prompt('Enter an image URL: ', img.src === TRANSPARENT_PIXEL ? '' : img.src);
                const imageSrc = (rawImageSrc === null ? img.src : rawImageSrc.trim()) || TRANSPARENT_PIXEL;

                if (imageSrc === TRANSPARENT_PIXEL) {
                    // img.removeAttribute('src');
                    img.setAttribute('hidden', true);
                } else {
                    target.disabled = true;
                    img.src = imageSrc;

                    img.onload = () => {
                        target.disabled = false;

                        if (img.src !== TRANSPARENT_PIXEL) img.removeAttribute('hidden');
                    };

                    img.onerror = () => {
                        target.disabled = false;
                        img.setAttribute('hidden', true);
                        img.src = TRANSPARENT_PIXEL;

                        setTimeout(() => {
                            // eslint-disable-next-line no-alert
                            alert('Error while loading the image.');
                        });
                    };
                }
            } else {
                // eslint-disable-next-line no-alert
                const char = (prompt('Enter an icon or character: ', target.textContent) || '').trim();

                target.textContent = char || target.textContent || '👉';
            }
        }
    }

}
