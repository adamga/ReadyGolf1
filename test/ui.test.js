const { Builder, By, until } = require('selenium-webdriver');

(async function readyGolfUITest() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    // 1. Open home page
    await driver.get('http://localhost:3000/');

    // 2. Click Login in the menu
    await driver.findElement(By.linkText('Login')).click();
    await driver.wait(until.elementLocated(By.id('username')), 5000);

    // 3. Enter username and password
    await driver.findElement(By.id('username')).sendKeys('Adam');
    await driver.findElement(By.id('password')).sendKeys('Squire560!!');

    // 4. Click login button (form submit)
    await driver.findElement(By.css('button[type="submit"]')).click();

    // 5. Wait for Booking link to appear and click it
    await driver.wait(until.elementLocated(By.linkText('Booking')), 5000);
    await driver.findElement(By.linkText('Booking')).click();

    // 6. Wait for date picker, pick today, and submit
    const today = new Date().toISOString().split('T')[0];
    const dateInput = await driver.findElement(By.id('date'));
    await dateInput.clear();
    await dateInput.sendKeys(today);
    await driver.findElement(By.css('button[type="submit"]')).click();

    // 7. Wait for tee times to be listed
    await driver.wait(until.elementLocated(By.xpath("//h3[contains(text(),'Available Tee Times')]")), 5000);
    const teeTimes = await driver.findElements(By.css('.list-group-item'));
    if (teeTimes.length > 0) {
      console.log('Tee times listed! Test passed.');
    } else {
      console.log('No tee times found!');
    }
  } finally {
    await driver.quit();
  }
})();