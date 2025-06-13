const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');
const assert = require('assert');

describe('ReadyGolf1 UI Tests', function() {
  let driver;
  this.timeout(20000);

  before(async function() {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async function() {
    await driver.quit();
  });

  it('Home page should show Login link', async function() {
    await driver.get('http://localhost:3000/');
    await driver.wait(until.titleContains('ReadyGolf'), 5000);
    let loginBtn = await driver.findElement(By.linkText('Login'));
    assert(loginBtn, 'Login button should be present');
  });

  it('Login flow should show error on bad credentials', async function() {
    await driver.get('http://localhost:3000/login');
    await driver.findElement(By.name('username')).sendKeys('fakeuser');
    await driver.findElement(By.name('password')).sendKeys('wrongpassword');
    await driver.findElement(By.css('button[type="submit"]')).click();
    // Wait for error message (alert-danger)
    let error = await driver.wait(until.elementLocated(By.css('.alert-danger')), 5000);
    assert(error, 'Error message should be shown');
  });

  it('Registration page should load', async function() {
    await driver.get('http://localhost:3000/register');
    let heading = await driver.findElement(By.tagName('h2'));
    let text = await heading.getText();
    assert(text.toLowerCase().includes('register'), 'Registration heading should be present');
  });

  it('Booking page should require login', async function() {
    await driver.get('http://localhost:3000/booking');
    // Should redirect to login or show login form
    let loginHeading = await driver.findElement(By.tagName('h2'));
    let text = await loginHeading.getText();
    assert(text.toLowerCase().includes('login'), 'Should be redirected to login page');
  });
});
