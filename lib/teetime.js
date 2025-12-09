/**
 * Generate tee times from 8:00 to 16:00 in 20 minute intervals
 * @returns {string[]} Array of time strings in HH:MM format
 */
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

module.exports = { generateTeeTimes };
