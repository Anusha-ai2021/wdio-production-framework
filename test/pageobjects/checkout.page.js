const Page = require('./page');

class CheckoutPage extends Page {
  get inputFirstName() { return $('#first-name'); }
  get inputLastName() { return $('#last-name'); }
  get inputZip() { return $('#postal-code'); }
  get btnContinue() { return $('#continue'); }
  get btnFinish() { return $('#finish'); }
  get completeHeader() { return $('.complete-header'); }
  get totalLabel() { return $('.summary_total_label'); }

  async fillInfo(firstName, lastName, zip) {
    await this.waitAndSetValue('#first-name', firstName);
    await this.waitAndSetValue('#last-name', lastName);
    await this.waitAndSetValue('#postal-code', zip);
    await this.waitAndClick('#continue');
  }

  finish() {
    return this.waitAndClick('#finish');
  }
}

module.exports = new CheckoutPage();
