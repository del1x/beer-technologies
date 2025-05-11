import '@testing-library/jest-dom';

afterEach(() => {

  document.body.innerHTML = '';
  
  jest.clearAllMocks();
});