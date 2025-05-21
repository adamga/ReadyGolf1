const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('./readygolf1.db');

// Create users table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)`);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    store: new SQLiteStore,
    secret: 'readygolf1secret',
    resave: false,
    saveUninitialized: false
}));

// Middleware to make user available in templates
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// Routes
app.get('/', (req, res) => {
    res.render('home', { user: req.session.user });
});

app.get('/privacy', (req, res) => {
    res.render('privacy', { user: req.session.user });
});

app.get('/login', (req, res) => {
    res.render('login', { user: req.session.user });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.user = { id: user.id, username: user.username };
            res.redirect('/');
        } else {
            res.render('login', { error: 'Invalid credentials', user: null });
        }
    });
});

app.get('/register', (req, res) => {
    res.render('register', { user: req.session.user });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function(err) {
        if (err) {
            res.render('register', { error: 'Username already taken', user: null });
        } else {
            req.session.user = { id: this.lastID, username };
            res.redirect('/');
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { error: null, success: null });
});

app.post('/forgot-password', (req, res) => {
    const { username, newPassword } = req.body;
    if (!username || !newPassword) {
        return res.render('forgot-password', { error: 'All fields are required.', success: null });
    }
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (!user) {
            return res.render('forgot-password', { error: 'User not found.', success: null });
        }
        const hash = bcrypt.hashSync(newPassword, 10);
        db.run('UPDATE users SET password = ? WHERE username = ?', [hash, username], function(err) {
            if (err) {
                return res.render('forgot-password', { error: 'Error updating password.', success: null });
            }
            res.render('forgot-password', { error: null, success: 'Password reset successfully. You can now log in.' });
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`ReadyGolf1 running on http://localhost:${PORT}`);
});
