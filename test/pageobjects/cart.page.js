const Page = require('./page');

class CartPage extends Page {
  get cartItems() { return $$('.cart_item'); }
  get btnCheckout() { return $('#checkout'); }

  checkout() {
    return this.waitAndClick('#checkout');
  }
}

module.exports = new CartPage();
