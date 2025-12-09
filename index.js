/**
 * ReadyGolf1 - Tee Time Booking Application
 * 
 * This is the main application file for the ReadyGolf1 tee time booking system.
 * It provides user authentication, registration, and tee time booking functionality
 * using Express.js web framework and SQLite database for data persistence.
 */

// Core dependencies
const express = require('express');           // Web application framework
const session = require('express-session');   // Session management middleware
const SQLiteStore = require('connect-sqlite3')(session); // SQLite session store
const path = require('path');                 // File path utilities
const bcrypt = require('bcryptjs');           // Password hashing library
const sqlite3 = require('sqlite3').verbose(); // SQLite database driver

// Initialize Express application and SQLite database
const app = express();
const db = new sqlite3.Database('./readygolf1.db');

/**
 * Database Initialization
 * Create the users table if it doesn't already exist.
 * Schema includes:
 * - id: Auto-incrementing primary key
 * - username: Unique username for each user
 * - password: Bcrypt hashed password for security
 */
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)`);

/**
 * Express Application Configuration
 */

// Set EJS as the template engine for rendering dynamic HTML
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: false }));

// Configure session management with SQLite storage
// Sessions are used to maintain user login state across requests
app.use(session({
    store: new SQLiteStore,              // Store sessions in SQLite database
    secret: 'readygolf1secret',          // Secret key for signing session ID cookie
    resave: false,                       // Don't save session if unmodified
    saveUninitialized: false             // Don't create session until something stored
}));

/**
 * Global Middleware
 * Makes the current user object available to all EJS templates.
 * This allows templates to conditionally display content based on authentication state.
 */
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

/**
 * Authentication Middleware
 * Protects routes that require user authentication.
 * Redirects unauthenticated users to the login page.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

/**
 * ========================================
 * ROUTE HANDLERS
 * ========================================
 */

/**
 * GET / - Home Page
 * Displays the welcome page with information about ReadyGolf1.
 * Shows login/register buttons for guests, or booking link for logged-in users.
 */
app.get('/', (req, res) => {
    res.render('home', { user: req.session.user });
});

/**
 * GET /privacy - Privacy Policy Page
 * Displays the privacy policy information for ReadyGolf1.
 */
app.get('/privacy', (req, res) => {
    res.render('privacy', { user: req.session.user });
});

/**
 * GET /login - Login Page
 * Displays the login form for users to authenticate.
 */
app.get('/login', (req, res) => {
    res.render('login', { user: req.session.user });
});

/**
 * POST /login - Handle Login Form Submission
 * Authenticates user credentials against the database.
 * On success: Creates a session and redirects to home page.
 * On failure: Re-renders login page with error message.
 */
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Query database for user with matching username
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        // Verify user exists and password matches the hashed password
        if (user && bcrypt.compareSync(password, user.password)) {
            // Create session with user information
            req.session.user = { id: user.id, username: user.username };
            res.redirect('/');
        } else {
            // Authentication failed - show error message
            res.render('login', { error: 'Invalid credentials', user: null });
        }
    });
});

/**
 * GET /register - Registration Page
 * Displays the registration form for new users.
 */
app.get('/register', (req, res) => {
    res.render('register', { user: req.session.user });
});

/**
 * POST /register - Handle Registration Form Submission
 * Creates a new user account with hashed password.
 * On success: Creates a session and redirects to home page.
 * On failure: Re-renders registration page with error message.
 */
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    
    // Hash the password using bcrypt with 10 salt rounds for security
    const hash = bcrypt.hashSync(password, 10);
    
    // Insert new user into database
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function(err) {
        if (err) {
            // Username already exists (UNIQUE constraint violation)
            res.render('register', { error: 'Username already taken', user: null });
        } else {
            // Registration successful - create session with new user ID
            req.session.user = { id: this.lastID, username };
            res.redirect('/');
        }
    });
});

/**
 * GET /logout - Logout Handler
 * Destroys the user's session and redirects to home page.
 */
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

/**
 * GET /forgot-password - Forgot Password Page
 * Displays the password reset form for users who forgot their password.
 */
app.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { error: null, success: null });
});

/**
 * POST /forgot-password - Handle Password Reset Form Submission
 * Allows users to reset their password by providing their username and new password.
 * Note: In production, this should be secured with email verification.
 */
app.post('/forgot-password', (req, res) => {
    const { username, newPassword } = req.body;
    
    // Validate that all required fields are provided
    if (!username || !newPassword) {
        return res.render('forgot-password', { error: 'All fields are required.', success: null });
    }
    
    // Check if user exists in database
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (!user) {
            return res.render('forgot-password', { error: 'User not found.', success: null });
        }
        
        // Hash the new password
        const hash = bcrypt.hashSync(newPassword, 10);
        
        // Update the user's password in the database
        db.run('UPDATE users SET password = ? WHERE username = ?', [hash, username], function(err) {
            if (err) {
                return res.render('forgot-password', { error: 'Error updating password.', success: null });
            }
            // Password reset successful
            res.render('forgot-password', { error: null, success: 'Password reset successfully. You can now log in.' });
        });
    });
});

/**
 * GET /booking - Tee Time Booking Page (Protected Route)
 * Displays the booking interface where users can select a date.
 * Requires authentication - redirects to login if not logged in.
 */
app.get('/booking', requireLogin, (req, res) => {
    res.render('booking', { user: req.session.user, selectedDate: null, times: null });
});

/**
 * POST /booking - Generate Available Tee Times (Protected Route)
 * Processes the selected date and generates available tee times.
 * Tee times are generated from 8:00 AM to 4:00 PM in 20-minute intervals.
 */
app.post('/booking', requireLogin, (req, res) => {
    const { date } = req.body;
    
    // Generate tee times from 8:00 to 16:00 in 20 minute intervals
    const times = [];
    let start = 8 * 60;  // 8:00 AM in minutes (8 * 60 = 480 minutes)
    let end = 16 * 60;   // 4:00 PM in minutes (16 * 60 = 960 minutes)
    
    // Loop through time slots in 20-minute increments
    while (start <= end) {
        // Convert minutes back to hours and minutes
        const h = Math.floor(start / 60).toString().padStart(2, '0');  // Hours with leading zero
        const m = (start % 60).toString().padStart(2, '0');            // Minutes with leading zero
        times.push(`${h}:${m}`);
        start += 20;  // Increment by 20 minutes
    }
    
    // Render the booking page with the selected date and available times
    res.render('booking', { user: req.session.user, selectedDate: date, times });
});

/**
 * ========================================
 * SERVER STARTUP
 * ========================================
 */

// Get port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Start the Express server
app.listen(PORT, () => {
    console.log(`ReadyGolf1 running on http://localhost:${PORT}`);
});
