// Basic Selenium test for ReadyGolf1 home page
const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

(async function testHomePage() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get('http://localhost:3000/');
    // Wait for the page title to load
    await driver.wait(until.titleContains('ReadyGolf'), 5000);
    // Example: check for a login button or link
    let loginBtn = await driver.findElement(By.linkText('Login'));
    if (loginBtn) {
      console.log('Login button found!');
    } else {
      console.log('Login button NOT found!');
    }
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await driver.quit();
  }
})();
