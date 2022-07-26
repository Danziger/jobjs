import { App } from './components/app/app.component';


window.addEventListener('load', () => {
    // CSS must be loaded for resizing to work:
    // eslint-disable-next-line no-new
    new App();
});
