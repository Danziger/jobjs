import './card.style.scss';

function resizeTextarea(textarea) {
    const { style } = textarea;

    style.height = 'auto';
    style.height = `${ Math.ceil(textarea.scrollHeight / 8) * 8 }px`;
}

function sanatizeInput(input) {
    const { value } = input;
    const parsedValue = value.trim().replace(/\s+/g, ' ');

    if (value !== parsedValue) {
        input.value = parsedValue;
    }

    if (input.tagName === 'TEXTAREA') {
        resizeTextarea(input);
    }
}


export class Card {

    static SIZE = 552;

    pasteTarget = null;
    focusTarget = null;

    data = {
        location: '',
        salary: {
            min: 60,
            max: 80,
            equityMin: 0.01,
            equityMax: 1.00,
        },
        techs: ['ES6', 'React', 'TypeScript'],
        other: [{
            icon: '📚',
            value: 'A',
        }, {
            icon: '🎉',
            value: 'B',
        }, {
            icon: '🔋',
            value: 'C',
        }],
    };

    constructor() {
        this.root = document.getElementById('root');
        this.preview = document.getElementById('preview');
        this.props = document.getElementById('props');

        // Resize the card to keep image/text proportion:
        this.resizeCard();

        // Resize any textarea with multiline placeholders:
        Array.from(document.querySelectorAll('.card__inputText')).forEach(resizeTextarea);

        this.resizeCard = this.resizeCard.bind(this);

        window.onresize = this.handleResize = this.handleResize.bind(this);
        document.onkeypress = this.handleKeyPress = this.handleKeyPress.bind(this);
        document.oninput = this.handleInput = this.handleInput.bind(this);
        document.onchange = this.handleChange = this.handleChange.bind(this);
        document.onpaste = this.handlePaste = this.handlePaste.bind(this);
        document.ondrop = this.handleDrop = this.handleDrop.bind(this);
        document.onclick = this.handleClick = this.handleClick.bind(this);
    }

    save() {
        console.log('save');
    }

    resizeCard() {
        const { root } = this;
        const { SIZE } = Card;

        this.preview.style.transform = `scale(${ Math.min(root.offsetWidth, root.offsetHeight, SIZE) / SIZE })`;
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
        const newItem = li.cloneNode(true);
        const newInput = newItem.querySelector('input, textarea');

        newInput.value = '';

        ul.appendChild(newItem);
        newInput.focus();

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

    handleKeyPress(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();

            this.checkInputs(e.target);
        }
    }

    handleInput({ target }) {
        console.log('input');

        if (this.pasteTarget === target) {
            sanatizeInput(target);
        } else if (target.tagName === 'TEXTAREA') {
            resizeTextarea(target);
        }

        this.pasteTarget = null;

        this.save();
    }

    handleChange({ target }) {
        console.log('change');

        sanatizeInput(target);

        this.checkInputs(target);
    }

    handlePaste({ target }) {
        console.log('paste');

        this.pasteTarget = target;
    }

    handleDrop({ target }) {
        console.log('drop');

        const { tagName } = target;

        if (tagName === 'TEXTAREA' || tagName === 'INPUT') {
            this.pasteTarget = target;
        }
    }

    handleClick({ target }) {
        console.log('click');

        const { tagName } = target;

        if (tagName === 'TEXTAREA' || tagName === 'INPUT') {
            this.focusTarget = target;
        }
    }

}
