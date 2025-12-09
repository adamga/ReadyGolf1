const request = require('supertest');
const { expect } = require('chai');
const createApp = require('../app');
const fs = require('fs');
const path = require('path');

describe('ReadyGolf1 Application Tests', function() {
    let app;
    const testDbPath = path.join(__dirname, 'test.db');

    beforeEach(function() {
        // Remove test database if it exists
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
        app = createApp(testDbPath);
    });

    afterEach(function(done) {
        // Close database connection
        if (app.locals.db) {
            app.locals.db.close((err) => {
                // Remove test database
                if (fs.existsSync(testDbPath)) {
                    fs.unlinkSync(testDbPath);
                }
                done(err);
            });
        } else {
            done();
        }
    });

    describe('GET /', function() {
        it('should return home page with status 200', function(done) {
            request(app)
                .get('/')
                .expect(200)
                .end(done);
        });

        it('should render the home page', function(done) {
            request(app)
                .get('/')
                .expect('Content-Type', /html/)
                .expect(200)
                .end(done);
        });
    });

    describe('GET /privacy', function() {
        it('should return privacy page with status 200', function(done) {
            request(app)
                .get('/privacy')
                .expect(200)
                .end(done);
        });
    });

    describe('GET /login', function() {
        it('should return login page with status 200', function(done) {
            request(app)
                .get('/login')
                .expect(200)
                .end(done);
        });
    });

    describe('GET /register', function() {
        it('should return register page with status 200', function(done) {
            request(app)
                .get('/register')
                .expect(200)
                .end(done);
        });
    });

    describe('POST /register', function() {
        it('should register a new user and redirect to home', function(done) {
            request(app)
                .post('/register')
                .type('form')
                .send({ username: 'testuser', password: 'testpass' })
                .expect(302)
                .expect('Location', '/')
                .end(done);
        });

        it('should not register duplicate username', function(done) {
            const agent = request.agent(app);
            
            // First registration
            agent
                .post('/register')
                .type('form')
                .send({ username: 'testuser', password: 'testpass' })
                .expect(302)
                .end(function(err) {
                    if (err) return done(err);

                    // Try to register with same username
                    agent
                        .post('/register')
                        .type('form')
                        .send({ username: 'testuser', password: 'anotherpass' })
                        .expect(200)
                        .expect(/Username already taken/)
                        .end(done);
                });
        });
    });

    describe('POST /login', function() {
        beforeEach(function(done) {
            // Register a test user
            request(app)
                .post('/register')
                .type('form')
                .send({ username: 'logintest', password: 'testpass123' })
                .end(done);
        });

        it('should login with valid credentials', function(done) {
            request(app)
                .post('/login')
                .type('form')
                .send({ username: 'logintest', password: 'testpass123' })
                .expect(302)
                .expect('Location', '/')
                .end(done);
        });

        it('should reject invalid credentials', function(done) {
            request(app)
                .post('/login')
                .type('form')
                .send({ username: 'logintest', password: 'wrongpass' })
                .expect(200)
                .expect(/Invalid credentials/)
                .end(done);
        });

        it('should reject non-existent user', function(done) {
            request(app)
                .post('/login')
                .type('form')
                .send({ username: 'nonexistent', password: 'testpass' })
                .expect(200)
                .expect(/Invalid credentials/)
                .end(done);
        });
    });

    describe('GET /logout', function() {
        it('should logout and redirect to home', function(done) {
            request(app)
                .get('/logout')
                .expect(302)
                .expect('Location', '/')
                .end(done);
        });
    });

    describe('GET /forgot-password', function() {
        it('should return forgot-password page with status 200', function(done) {
            request(app)
                .get('/forgot-password')
                .expect(200)
                .end(done);
        });
    });

    describe('POST /forgot-password', function() {
        beforeEach(function(done) {
            // Register a test user
            request(app)
                .post('/register')
                .type('form')
                .send({ username: 'resetuser', password: 'oldpassword' })
                .end(done);
        });

        it('should reset password for existing user', function(done) {
            request(app)
                .post('/forgot-password')
                .type('form')
                .send({ username: 'resetuser', newPassword: 'newpassword' })
                .expect(200)
                .expect(/Password reset successfully/)
                .end(done);
        });

        it('should reject password reset for non-existent user', function(done) {
            request(app)
                .post('/forgot-password')
                .type('form')
                .send({ username: 'nonexistent', newPassword: 'newpassword' })
                .expect(200)
                .expect(/User not found/)
                .end(done);
        });

        it('should require all fields', function(done) {
            request(app)
                .post('/forgot-password')
                .type('form')
                .send({ username: 'resetuser' })
                .expect(200)
                .expect(/All fields are required/)
                .end(done);
        });
    });

    describe('GET /booking', function() {
        it('should redirect to login when not authenticated', function(done) {
            request(app)
                .get('/booking')
                .expect(302)
                .expect('Location', '/login')
                .end(done);
        });

        it('should return booking page when authenticated', function(done) {
            const agent = request.agent(app);
            
            // Register and login
            agent
                .post('/register')
                .type('form')
                .send({ username: 'bookinguser', password: 'testpass' })
                .end(function(err) {
                    if (err) return done(err);

                    agent
                        .get('/booking')
                        .expect(200)
                        .end(done);
                });
        });
    });

    describe('POST /booking', function() {
        it('should redirect to login when not authenticated', function(done) {
            request(app)
                .post('/booking')
                .type('form')
                .send({ date: '2024-12-25' })
                .expect(302)
                .expect('Location', '/login')
                .end(done);
        });

        it('should generate tee times when authenticated', function(done) {
            const agent = request.agent(app);
            
            // Register and login
            agent
                .post('/register')
                .type('form')
                .send({ username: 'bookinguser', password: 'testpass' })
                .end(function(err) {
                    if (err) return done(err);

                    agent
                        .post('/booking')
                        .type('form')
                        .send({ date: '2024-12-25' })
                        .expect(200)
                        .expect(/08:00/)
                        .expect(/16:00/)
                        .end(done);
                });
        });
    });
});
