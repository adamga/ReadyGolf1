const { expect } = require('chai');

describe('Tee Time Generation Logic', function() {
    function generateTeeTimes() {
        const times = [];
        let start = 8 * 60; // 8:00 in minutes
        let end = 16 * 60; // 16:00 in minutes
        while (start <= end) {
            const h = Math.floor(start / 60).toString().padStart(2, '0');
            const m = (start % 60).toString().padStart(2, '0');
            times.push(`${h}:${m}`);
            start += 20;
        }
        return times;
    }

    describe('generateTeeTimes', function() {
        it('should generate tee times from 8:00 to 16:00', function() {
            const times = generateTeeTimes();
            expect(times).to.be.an('array');
            expect(times[0]).to.equal('08:00');
            expect(times[times.length - 1]).to.equal('16:00');
        });

        it('should generate times at 20 minute intervals', function() {
            const times = generateTeeTimes();
            expect(times).to.include('08:00');
            expect(times).to.include('08:20');
            expect(times).to.include('08:40');
            expect(times).to.include('09:00');
        });

        it('should generate correct number of time slots', function() {
            const times = generateTeeTimes();
            // From 8:00 to 16:00 is 8 hours = 480 minutes
            // With 20-minute intervals, we should have 480/20 + 1 = 25 slots
            expect(times).to.have.lengthOf(25);
        });

        it('should format hours with leading zeros', function() {
            const times = generateTeeTimes();
            expect(times[0]).to.equal('08:00');
            expect(times).to.include('09:00');
        });

        it('should format minutes with leading zeros', function() {
            const times = generateTeeTimes();
            expect(times).to.include('08:00');
            expect(times).to.include('08:20');
        });

        it('should include afternoon times', function() {
            const times = generateTeeTimes();
            expect(times).to.include('12:00');
            expect(times).to.include('14:00');
            expect(times).to.include('16:00');
        });

        it('should have consistent time increments', function() {
            const times = generateTeeTimes();
            for (let i = 1; i < times.length; i++) {
                const [prevH, prevM] = times[i - 1].split(':').map(Number);
                const [currH, currM] = times[i].split(':').map(Number);
                const prevMinutes = prevH * 60 + prevM;
                const currMinutes = currH * 60 + currM;
                expect(currMinutes - prevMinutes).to.equal(20);
            }
        });
    });
});
