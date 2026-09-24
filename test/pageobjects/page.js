class Page {
  open(path = '') {
    return browser.url(path);
  }

  async waitAndClick(selector) {
    const el = await $(selector);
    await el.waitForClickable();
    await el.click();
  }

  async waitAndSetValue(selector, value) {
    const el = await $(selector);
    await el.waitForDisplayed();
    await el.setValue(value);
  }

  async getText(selector) {
    const el = await $(selector);
    await el.waitForDisplayed();
    return el.getText();
  }
}

module.exports = Page;
