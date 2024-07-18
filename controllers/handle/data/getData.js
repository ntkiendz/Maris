const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
        db.run(`
            CREATE TABLE IF NOT EXISTS threads (
                threadID TEXT PRIMARY KEY,
                data TEXT
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                userID TEXT PRIMARY KEY,
                data TEXT
            )
        `);
    }
});

function getThreadInfo(threadID) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT data FROM threads WHERE threadID = ?
        `, [threadID], function(err, row) {
            if (err) {
                console.error('Error fetching thread info', err);
                reject(err);
            } else {
                resolve(row ? JSON.parse(row.data) : null);
            }
        });
    });
}

function getUserInfo(userID) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT data FROM users WHERE userID = ?
        `, [userID], function(err, row) {
            if (err) {
                console.error('Error fetching user info', err);
                reject(err);
            } else {
                resolve(row ? JSON.parse(row.data) : null);
            }
        });
    });
}

module.exports = {
    getThreadInfo,
    getUserInfo
};
