const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

// Simple test without mocha framework
async function runUITests() {
    let driver;
    const baseUrl = 'http://localhost:3000';
    const testUsername = 'Scottie';
    const testPassword = 'Scottie';

    try {
        console.log('Setting up Chrome WebDriver...');
        
        // Configure Chrome options
        const options = new chrome.Options();
        options.addArguments('--headless'); // Run in headless mode
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');
        options.addArguments('--window-size=1920,1080');
        options.addArguments('--remote-debugging-port=9222');

        // Initialize driver
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        console.log('✓ Chrome WebDriver initialized successfully');

        // Step 1: Navigate to home page
        console.log('Step 1: Navigating to home page...');
        await driver.get(baseUrl);
        await driver.wait(until.titleContains('ReadyGolf1'), 5000);
        console.log('✓ Successfully loaded home page');

        // Step 2: Navigate to registration page
        console.log('Step 2: Navigating to registration page...');
        await driver.get(`${baseUrl}/register`);
        await driver.wait(until.titleContains('ReadyGolf1'), 5000);
        console.log('✓ Successfully navigated to registration page');

        // Step 3: Register new user
        console.log('Step 3: Registering new user...');
        const usernameField = await driver.wait(until.elementLocated(By.id('username')), 5000);
        const passwordField = await driver.wait(until.elementLocated(By.id('password')), 5000);
        const registerButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 5000);

        await usernameField.clear();
        await usernameField.sendKeys(testUsername);
        await passwordField.clear();
        await passwordField.sendKeys(testPassword);
        await registerButton.click();

        // Wait for redirect after registration (should go to home page with user logged in)
        await driver.wait(until.urlIs(baseUrl + '/'), 10000);
        
        // Verify user is logged in by checking for username in navbar
        const navbar = await driver.wait(until.elementLocated(By.css('.navbar')), 5000);
        const navbarText = await navbar.getText();
        
        if (!navbarText.includes(testUsername)) {
            throw new Error('User should be logged in after registration');
        }
        console.log('✓ Successfully registered and automatically logged in');

        // Step 4: Logout
        console.log('Step 4: Logging out...');
        const logoutLink = await driver.wait(until.elementLocated(By.linkText('Logout')), 5000);
        await logoutLink.click();
        
        // Wait for redirect to home page
        await driver.wait(until.urlIs(baseUrl + '/'), 5000);
        
        // Verify logout by checking for Login link
        await driver.wait(until.elementLocated(By.linkText('Login')), 5000);
        console.log('✓ Successfully logged out');

        // Step 5: Login again
        console.log('Step 5: Logging in again...');
        const loginLink = await driver.wait(until.elementLocated(By.linkText('Login')), 5000);
        await loginLink.click();
        
        await driver.wait(until.urlIs(baseUrl + '/login'), 5000);
        
        const loginUsernameField = await driver.wait(until.elementLocated(By.id('username')), 5000);
        const loginPasswordField = await driver.wait(until.elementLocated(By.id('password')), 5000);
        const loginButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 5000);

        await loginUsernameField.clear();
        await loginUsernameField.sendKeys(testUsername);
        await loginPasswordField.clear();
        await loginPasswordField.sendKeys(testPassword);
        await loginButton.click();

        // Wait for redirect after login
        await driver.wait(until.urlIs(baseUrl + '/'), 10000);
        
        // Verify login successful
        const navbarAfterLogin = await driver.wait(until.elementLocated(By.css('.navbar')), 5000);
        const navbarAfterLoginText = await navbarAfterLogin.getText();
        
        if (!navbarAfterLoginText.includes(testUsername)) {
            throw new Error('User should be logged in after login');
        }
        console.log('✓ Successfully logged in again');

        // Step 6: Navigate to booking page
        console.log('Step 6: Navigating to booking page...');
        const bookingLink = await driver.wait(until.elementLocated(By.linkText('Booking')), 5000);
        await bookingLink.click();
        
        await driver.wait(until.urlIs(baseUrl + '/booking'), 5000);
        console.log('✓ Successfully navigated to booking page');

        // Step 7: Select a date one month from now
        console.log('Step 7: Selecting date one month from now...');
        const dateField = await driver.wait(until.elementLocated(By.id('date')), 5000);
        
        // Calculate date one month from now
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        const formattedDate = nextMonth.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        await dateField.clear();
        await dateField.sendKeys(formattedDate);
        console.log(`✓ Selected date: ${formattedDate}`);

        // Step 8: Submit to show available times
        console.log('Step 8: Submitting to show available times...');
        const showTimesButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 5000);
        await showTimesButton.click();

        // Wait for the page to reload with available times
        await driver.wait(until.urlIs(baseUrl + '/booking'), 10000);
        
        // Step 9: Verify tee times are displayed
        console.log('Step 9: Verifying tee times are displayed...');
        const timesList = await driver.wait(until.elementLocated(By.css('.list-group')), 10000);
        const times = await timesList.findElements(By.css('.list-group-item'));
        
        if (times.length === 0) {
            throw new Error('Available tee times should be displayed');
        }
        console.log(`✓ Successfully displayed ${times.length} available tee times`);
        
        // Log the first few times for verification
        const firstTime = await times[0].getText();
        console.log(`✓ First available time: ${firstTime}`);

        console.log('\n🎉 All UI tests completed successfully!');
        console.log('✅ Registration process validated');
        console.log('✅ Login/logout functionality validated');
        console.log('✅ Tee time booking interface validated');

        return true;

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        // Take a screenshot for debugging
        try {
            const screenshot = await driver.takeScreenshot();
            require('fs').writeFileSync('/tmp/test-failure-screenshot.png', screenshot, 'base64');
            console.log('📷 Screenshot saved to /tmp/test-failure-screenshot.png');
        } catch (screenshotError) {
            console.error('Failed to take screenshot:', screenshotError.message);
        }
        
        return false;
    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}

// Run the tests
if (require.main === module) {
    runUITests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = runUITests;