// Basic Selenium test for ReadyGolf1 home page
const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

(async function readyGolfHomeTest() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get('http://localhost:3000/');
    // Wait for the page title to load
    await driver.wait(until.titleContains('ReadyGolf'), 5000);
    const title = await driver.getTitle();
    console.log('Page title is:', title);
    // Example: check for a login prompt or button
    const loginPrompt = await driver.findElement(By.xpath("//*[contains(text(),'login') or contains(text(),'Login') or contains(text(),'sign in') or contains(text(),'Sign In')]")).getText();
    console.log('Login prompt found:', loginPrompt);
  } finally {
    await driver.quit();
  }
})();
