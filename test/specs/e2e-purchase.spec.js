const LoginPage = require('../pageobjects/login.page');
const InventoryPage = require('../pageobjects/inventory.page');
const CartPage = require('../pageobjects/cart.page');
const CheckoutPage = require('../pageobjects/checkout.page');

describe('SauceDemo - End-to-end purchase', () => {
  it('should let a user log in, add a product, check out, and complete the order', async () => {
    // 1. Login
    await LoginPage.open();
    await LoginPage.login(process.env.SAUCE_USERNAME, process.env.SAUCE_PASSWORD);
    await expect(InventoryPage.pageTitle).toHaveText('Products');

    // 2. Add product to cart
    await InventoryPage.addToCartByName('Sauce Labs Backpack');
    await expect(InventoryPage.cartBadge).toHaveText('1');

    // 3. Go to cart and checkout
    await InventoryPage.goToCart();
    await CartPage.checkout();

    // 4. Fill shipping info
    await CheckoutPage.fillInfo('John', 'Doe', '10001');
    await expect(CheckoutPage.totalLabel).toBeDisplayed();

    // 5. Finish order
    await CheckoutPage.finish();
    await expect(CheckoutPage.completeHeader).toHaveText('Thank you for your order!');
  });
});
