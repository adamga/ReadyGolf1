// Selenium test for registration, login, and booking flows in ReadyGolf1
const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

(async function readyGolfFlowsTest() {
  let driver = await new Builder().forBrowser('chrome').build();
  // Use a unique username for each test run
  const uniqueUsername = 'testuser_' + Date.now();
  const password = 'TestPassword123!';
  try {
    // Registration
    await driver.get('http://localhost:3000/register');
    await driver.wait(until.elementLocated(By.name('username')), 5000);
    await driver.findElement(By.name('username')).sendKeys(uniqueUsername);
    await driver.findElement(By.name('password')).sendKeys(password);
    await driver.findElement(By.css('button[type="submit"]')).click();
    // Wait for redirect to home page after registration
    await driver.wait(until.urlIs('http://localhost:3000/'), 5000);
    console.log('Registration test passed.');

    // Logout to test login flow
    await driver.get('http://localhost:3000/logout');

    // Login
    await driver.get('http://localhost:3000/login');
    await driver.wait(until.elementLocated(By.name('username')), 5000);
    await driver.findElement(By.name('username')).sendKeys(uniqueUsername);
    await driver.findElement(By.name('password')).sendKeys(password);
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlIs('http://localhost:3000/'), 5000);
    console.log('Login test passed.');

    // Booking (select a date and submit)
    await driver.get('http://localhost:3000/booking');
    await driver.wait(until.elementLocated(By.name('date')), 5000);
    // Use tomorrow's date
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    await driver.findElement(By.name('date')).sendKeys(tomorrow);
    await driver.findElement(By.css('button[type="submit"]')).click();
    // Wait for available times list
    await driver.wait(until.elementLocated(By.css('ul.list-group')), 5000);
    const timesList = await driver.findElements(By.css('ul.list-group li'));
    if (timesList.length > 0) {
      console.log('Booking test passed: Available times listed.');
    } else {
      throw new Error('No available times found after booking.');
    }
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await driver.quit();
  }
})();
