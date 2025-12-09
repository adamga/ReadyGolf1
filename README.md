# ReadyGolf1

ReadyGolf1 is a Node.js web application for booking golf tee times. It features:
- A home page with a top navigation menu
- Privacy page
- Membership system with authentication
- Portable database (SQLite, no separate server required)

## Getting Started
1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. Visit `http://localhost:3000` in your browser

Log in or register to book tee times!

## Running Tests
This project includes comprehensive unit tests using Mocha, Chai, and Supertest.

To run the test suite:
```bash
npm test
```

The tests cover:
- All route handlers (home, privacy, login, register, logout, booking, forgot-password)
- Authentication and password management
- Session management
- Tee time generation logic
- Protected route middleware

Tests are automatically run against a separate test database that is created and cleaned up for each test.
