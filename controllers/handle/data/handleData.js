const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        return console.error('Could not connect to database', err);
    }
    console.log('Connected to database');
});

const runQuery = (query, params, errorMessage) => {
    db.run(query, params, (err) => {
        if (err) {
            console.error(errorMessage, err);
        }
    });
};

const saveInfo = (threadID, data) => {
    runQuery(`
        INSERT OR REPLACE INTO threads (threadID, data) 
        VALUES (?, ?)
    `, [threadID, JSON.stringify(data)], 'Error saving thread info');
};

const saveUsers = (userID, data) => {
    runQuery(`
        INSERT OR REPLACE INTO users (userID, data) 
        VALUES (?, ?)
    `, [userID, JSON.stringify(data)], 'Error saving user info');
};

module.exports = {
    saveInfo,
    saveUsers
};
