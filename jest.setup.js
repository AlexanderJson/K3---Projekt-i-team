import jestAxe from "jest-axe";
import '@testing-library/jest-dom';

expect.extend(jestAxe.toHaveNoViolations);

if (typeof window.HTMLDialogElement === 'function') {
    window.HTMLDialogElement.prototype.showModal = function () {
        this.setAttribute('open', '');
    };
    window.HTMLDialogElement.prototype.close = function () {
        this.removeAttribute('open');
    };
}
