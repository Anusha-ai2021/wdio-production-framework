const Page = require('./page');

class InventoryPage extends Page {
  get pageTitle() { return $('.title'); }
  get cartBadge() { return $('.shopping_cart_badge'); }
  get cartIcon() { return $('.shopping_cart_link'); }

  addToCartByName(productName) {
    const slug = productName.toLowerCase().replace(/\s+/g, '-');
    return this.waitAndClick(`#add-to-cart-${slug}`);
  }

  goToCart() {
    return this.waitAndClick('.shopping_cart_link');
  }
}

module.exports = new InventoryPage();
