/**
 * ReadyGolf1 - Selenium UI Test Suite
 * 
 * This file contains automated UI tests for the ReadyGolf1 application using Selenium WebDriver.
 * The tests simulate a complete user journey: navigating to the site, logging in, and booking a tee time.
 * 
 * Prerequisites:
 * - The application must be running on http://localhost:3000
 * - Chrome browser and ChromeDriver must be installed
 * - Test user "Adam" with password "Squire560!!" must exist in the database
 */

// Import Selenium WebDriver components
const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');  // Chrome driver for browser automation

/**
 * Main Test Function
 * Executes the complete user flow for booking a tee time.
 * 
 * Test Steps:
 * 1. Navigate to home page
 * 2. Click login link
 * 3. Submit login credentials
 * 4. Navigate to booking page
 * 5. Select a date and view available times
 * 6. Verify tee times are displayed
 */
async function runTest() {
    // Initialize Chrome WebDriver
    let driver = await new Builder().forBrowser('chrome').build();
    
    try {
        // STEP 1: Navigate to the home page and verify it loads
        await driver.get('http://localhost:3000');
        await driver.wait(until.titleContains('ReadyGolf1'), 5000);

        // STEP 2: Click the "Login" link in the navigation menu
        await driver.findElement(By.linkText('Login')).click();
        // Wait for login form to appear
        await driver.wait(until.elementLocated(By.id('username')), 5000);

        // STEP 3: Fill in login credentials and submit the form
        await driver.findElement(By.id('username')).sendKeys('Adam');
        await driver.findElement(By.id('password')).sendKeys('Squire560!!');
        await driver.findElement(By.css('button[type="submit"]')).click();

        // STEP 4: Wait for successful login, then navigate to booking page
        await driver.wait(until.elementLocated(By.linkText('Booking')), 5000);
        await driver.findElement(By.linkText('Booking')).click();

        // STEP 5: Select today's date and submit to view available tee times
        const today = new Date().toISOString().split('T')[0];  // Format: YYYY-MM-DD
        const dateInput = await driver.findElement(By.id('date'));
        await dateInput.clear();
        await dateInput.sendKeys(today);
        await driver.findElement(By.css('button[type="submit"]')).click();

        // STEP 6: Verify that tee times are displayed
        await driver.wait(until.elementLocated(By.xpath("//h3[contains(text(),'Available Tee Times')]")), 5000);
        const teeTimes = await driver.findElements(By.css('.list-group-item'));
        
        // Validate test results
        if (teeTimes.length > 0) {
            console.log('Tee times listed! Test passed.');
        } else {
            throw new Error('No tee times found!');
        }
    } finally {
        // Clean up: Close the browser regardless of test outcome
        await driver.quit();
    }
}

/**
 * Execute the test and handle any errors
 * If the test fails, log the error and exit with error code
 */
runTest().catch(e => {
    console.error('Test failed:', e);
    process.exit(1);  // Exit with error code to indicate test failure
});
