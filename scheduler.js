

const cron = require('node-cron');
const axios = require('axios')
const fs = require('fs');
const path = require('path');
cron.schedule('* * * * *', async () => {
    // Run the API route every day at midnight (00:00)
    const logDirectory = path.join(__dirname, 'src/shared/logs');
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    try {
        const response = await axios.get('http://localhost:3000/api/dailyScheduler'); // Replace with your API route URL
        fs.readdirSync(logDirectory).forEach((file) => {
            const filePath = path.join(logDirectory, file);
            const stats = fs.statSync(filePath);
            if (stats.isFile() && stats.mtime < sevenDaysAgo) {
                fs.unlinkSync(filePath);
            }
        });
    } catch (error) {
        console.error('Error scheduling the task:', error);
    }
});