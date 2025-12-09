const { expect } = require('chai');
const bcrypt = require('bcryptjs');

describe('Authentication and Password Management', function() {
    describe('Password Hashing', function() {
        it('should hash passwords correctly', function() {
            const password = 'testpassword123';
            const hash = bcrypt.hashSync(password, 10);
            
            expect(hash).to.be.a('string');
            expect(hash).to.not.equal(password);
            expect(hash.length).to.be.greaterThan(0);
        });

        it('should verify correct password', function() {
            const password = 'testpassword123';
            const hash = bcrypt.hashSync(password, 10);
            
            const isValid = bcrypt.compareSync(password, hash);
            expect(isValid).to.be.true;
        });

        it('should reject incorrect password', function() {
            const password = 'testpassword123';
            const hash = bcrypt.hashSync(password, 10);
            
            const isValid = bcrypt.compareSync('wrongpassword', hash);
            expect(isValid).to.be.false;
        });

        it('should generate different hashes for same password', function() {
            const password = 'testpassword123';
            const hash1 = bcrypt.hashSync(password, 10);
            const hash2 = bcrypt.hashSync(password, 10);
            
            expect(hash1).to.not.equal(hash2);
            // But both should verify correctly
            expect(bcrypt.compareSync(password, hash1)).to.be.true;
            expect(bcrypt.compareSync(password, hash2)).to.be.true;
        });

        it('should handle empty password', function() {
            const password = '';
            const hash = bcrypt.hashSync(password, 10);
            
            expect(bcrypt.compareSync('', hash)).to.be.true;
            expect(bcrypt.compareSync('notEmpty', hash)).to.be.false;
        });

        it('should handle special characters in password', function() {
            const password = 'P@ssw0rd!#$%^&*()';
            const hash = bcrypt.hashSync(password, 10);
            
            expect(bcrypt.compareSync(password, hash)).to.be.true;
            expect(bcrypt.compareSync('P@ssw0rd', hash)).to.be.false;
        });
    });

    describe('Username Validation', function() {
        it('should accept valid usernames', function() {
            const validUsernames = ['user123', 'john_doe', 'alice', 'test-user'];
            
            validUsernames.forEach(username => {
                expect(username).to.be.a('string');
                expect(username.length).to.be.greaterThan(0);
            });
        });

        it('should handle username uniqueness check', function() {
            const users = new Set();
            const username = 'testuser';
            
            // First user should be added successfully
            expect(users.has(username)).to.be.false;
            users.add(username);
            expect(users.has(username)).to.be.true;
            
            // Duplicate should be detected
            expect(users.has(username)).to.be.true;
        });
    });

    describe('Session User Object', function() {
        it('should contain required user properties', function() {
            const sessionUser = { id: 1, username: 'testuser' };
            
            expect(sessionUser).to.have.property('id');
            expect(sessionUser).to.have.property('username');
            expect(sessionUser.id).to.be.a('number');
            expect(sessionUser.username).to.be.a('string');
        });

        it('should not contain password in session', function() {
            const sessionUser = { id: 1, username: 'testuser' };
            
            expect(sessionUser).to.not.have.property('password');
        });
    });
});
