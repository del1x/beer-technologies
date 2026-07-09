import '@testing-library/jest-dom';

Object.defineProperty(HTMLElement.prototype, 'innerText', {
  configurable: true,
  get() {
    return this.textContent ?? '';
  },
  set(value: string) {
    this.textContent = value;
  }
});

afterEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  jest.restoreAllMocks();
  jest.clearAllMocks();
});
