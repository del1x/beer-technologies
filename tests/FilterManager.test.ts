import { FilterManager } from '@modules/FilterManager';

describe('FilterManager', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button class="btn-filter active" data-filter="all"></button>
      <button class="btn-filter" data-filter="dark"></button>
      <button class="btn-filter" data-filter="light"></button>
      <section class="stance-section" data-stance="dark"></section>
      <section class="stance-section" data-stance="light"></section>
    `;
  });

  it('keeps all sections visible by default and filters by stance', () => {
    const manager = new FilterManager(
      document.querySelectorAll('.btn-filter'),
      document.querySelectorAll('.stance-section')
    );
    const sections = document.querySelectorAll<HTMLElement>('.stance-section');

    manager.init();
    expect(sections[0].style.display).toBe('');
    expect(sections[1].style.display).toBe('');

    (document.querySelector('[data-filter="dark"]') as HTMLElement).click();
    expect(sections[0].style.display).toBe('block');
    expect(sections[1].style.display).toBe('none');
  });

  it('preserves active button and aria-pressed behavior', () => {
    const buttons = document.querySelectorAll<HTMLElement>('.btn-filter');
    const manager = new FilterManager(
      buttons,
      document.querySelectorAll('.stance-section')
    );

    manager.init();
    buttons[2].click();

    expect(buttons[2]).toHaveClass('active');
    expect(buttons[2].ariaPressed).toBe('true');
    expect(buttons[0]).not.toHaveClass('active');
    expect(buttons[0].ariaPressed).toBe('false');
  });
});
