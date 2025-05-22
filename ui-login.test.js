const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

async function runTest() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        // 1. Go to the home page
        await driver.get('http://localhost:3000');
        await driver.wait(until.titleContains('ReadyGolf1'), 5000);

        // 2. Click Login in the menu
        await driver.findElement(By.linkText('Login')).click();
        await driver.wait(until.elementLocated(By.id('username')), 5000);

        // 3. Fill in login form and submit
        await driver.findElement(By.id('username')).sendKeys('Adam');
        await driver.findElement(By.id('password')).sendKeys('Squire560!!');
        await driver.findElement(By.css('button[type="submit"]')).click();

        // 4. Wait for Booking link to appear and click it
        await driver.wait(until.elementLocated(By.linkText('Booking')), 5000);
        await driver.findElement(By.linkText('Booking')).click();

        // 5. Wait for date picker, pick today, and submit
        const today = new Date().toISOString().split('T')[0];
        const dateInput = await driver.findElement(By.id('date'));
        await dateInput.clear();
        await dateInput.sendKeys(today);
        await driver.findElement(By.css('button[type="submit"]')).click();

        // 6. Wait for tee times to be listed
        await driver.wait(until.elementLocated(By.xpath("//h3[contains(text(),'Available Tee Times')]")), 5000);
        const teeTimes = await driver.findElements(By.css('.list-group-item'));
        if (teeTimes.length > 0) {
            console.log('Tee times listed! Test passed.');
        } else {
            throw new Error('No tee times found!');
        }
    } finally {
        await driver.quit();
    }
}

runTest().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});
