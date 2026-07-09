jest.mock('@modules/PDF/PDFGenerator', () => ({
  PDFGenerator: jest.fn().mockImplementation(() => ({}))
}));

import { PDFManager } from '@modules/PDF/PDFManager';
import { PDFPreviewUI } from '@modules/PDF/PDFPreviewUI';

describe('PDFManager', () => {
  it('opens one preview at a time and allows reopening after close', async () => {
    const trigger = document.createElement('button');
    const content = document.createElement('main');
    content.innerHTML = '<section class="intro-section">Current content</section>';
    document.body.append(trigger, content);

    const showPreview = jest
      .spyOn(PDFPreviewUI.prototype, 'show')
      .mockResolvedValue(undefined);
    const manager = new PDFManager(trigger, content);

    manager.init();
    trigger.click();
    await Promise.resolve();
    trigger.click();
    await Promise.resolve();

    expect(showPreview).toHaveBeenCalledTimes(1);

    manager.onPreviewClose();
    trigger.click();
    await Promise.resolve();

    expect(showPreview).toHaveBeenCalledTimes(2);
  });

  it('does not register duplicate click listeners when init is called twice', async () => {
    const trigger = document.createElement('button');
    const content = document.createElement('main');
    const showPreview = jest
      .spyOn(PDFPreviewUI.prototype, 'show')
      .mockResolvedValue(undefined);
    const manager = new PDFManager(trigger, content);

    manager.init();
    manager.init();
    trigger.click();
    await Promise.resolve();

    expect(showPreview).toHaveBeenCalledTimes(1);
  });
});
