const LoginPage = require('../pageobjects/login.page');
const InventoryPage = require('../pageobjects/inventory.page');

describe('SauceDemo - Login', () => {
  beforeEach(async () => {
    await LoginPage.open();
  });

  it('should log in successfully with valid standard_user credentials', async () => {
    await LoginPage.login(process.env.SAUCE_USERNAME, process.env.SAUCE_PASSWORD);
    await expect(InventoryPage.pageTitle).toHaveText('Products');
  });

  it('should reject login with an invalid password', async () => {
    await LoginPage.login(process.env.SAUCE_USERNAME, 'wrong_password');
    await expect(LoginPage.errorMessage).toBeDisplayed();
await expect(LoginPage.errorMessage).toHaveText('Username and password do not match', { containing: true });  });

  it('should block a locked-out user', async () => {
    await LoginPage.login('locked_out_user', process.env.SAUCE_PASSWORD);
await expect(LoginPage.errorMessage).toHaveText('locked out', { containing: true });
  });
});
