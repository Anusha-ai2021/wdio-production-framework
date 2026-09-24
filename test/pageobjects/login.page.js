const Page = require('./page');

class LoginPage extends Page {
  get inputUsername() { return $('#user-name'); }
  get inputPassword() { return $('#password'); }
  get btnLogin() { return $('#login-button'); }
  get errorMessage() { return $('[data-test="error"]'); }

  async login(username, password) {
    await this.waitAndSetValue('#user-name', username);
    await this.waitAndSetValue('#password', password);
    await this.waitAndClick('#login-button');
  }

  open() {
    return super.open('/');
  }
}

module.exports = new LoginPage();
