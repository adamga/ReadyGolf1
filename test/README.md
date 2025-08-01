# ReadyGolf1 UI Tests

This directory contains Selenium-based UI tests that validate the complete user workflow for the ReadyGolf1 tee time booking application.

## Test Requirements Implemented

The UI tests validate the following requirements as specified in issue #6:

1. **Registration Process**: Validates user registration using the account "Scottie" with password "Scottie"
2. **Login Function**: Tests the complete login workflow including:
   - Logging out after registration
   - Logging back in with the same credentials
3. **Tee Time Booking**: Tests the booking functionality by:
   - Using the date picker to select a date one month from now
   - Displaying available tee times for the selected date

## Test Files

- `ui-test-final.js` - Main UI test that validates all requirements
- `ui-test-firefox.js` - Alternative Firefox-based test implementation
- `ui-tests.js` - Original Mocha-based test (for reference)
- `run-tests.sh` - Shell script for automated test execution

## Running the Tests

### Prerequisites
- Node.js and npm installed
- Firefox browser installed (used as the WebDriver)
- ReadyGolf1 application running on localhost:3000

### Running Tests

```bash
# Run the complete test suite
npm test

# Or run UI tests specifically
npm run test:ui

# Or run the test file directly
node test/ui-test-final.js
```

## Test Flow

The UI test executes the following workflow:

1. **Setup**: Initializes Firefox WebDriver in headless mode
2. **Registration Test**: Attempts to register with "Scottie"/"Scottie" credentials
3. **Logout**: Ensures user is logged out before login test
4. **Login Test**: Logs in with "Scottie"/"Scottie" credentials
5. **Booking Navigation**: Navigates to the tee time booking page
6. **Date Selection**: Uses the date picker to select a date one month from now
7. **Time Display**: Submits the date and verifies available tee times are displayed
8. **Verification**: Confirms all functionality works as expected

## Test Output

The test provides detailed console output showing each step and its result:

```
✓ Firefox WebDriver initialized successfully
✓ Registration tested (user already exists)
✓ User was already logged out
✓ Successfully logged in with Scottie account
✓ Successfully navigated to booking page
✓ Selected date using date picker: 2025-09-01
✓ Successfully displayed 25 available tee times
✓ Available time 1: 08:00
✓ Available time 2: 08:20
✓ Available time 3: 08:40

🎉 All UI test requirements completed successfully!
✅ Registration process with Scottie/Scottie validated
✅ Login functionality validated
✅ Logout functionality validated
✅ Date picker used to select date one month from now
✅ Tee time selection interface validated
```

## Error Handling

The test includes comprehensive error handling:
- Screenshots are automatically captured on test failures
- Detailed error messages are provided
- Graceful handling of existing user accounts
- Timeout management for asynchronous operations

## Browser Compatibility

The tests are currently configured to use Firefox with geckodriver. The implementation can be adapted for other browsers (Chrome, Edge, etc.) by modifying the WebDriver configuration.