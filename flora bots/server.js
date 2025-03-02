const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = process.env.PORT || 3000; // Use Vercel's provided port

app.use(bodyParser.json());

// Connect to SQLite database
const db = new sqlite3.Database('./database.sqlite');

// Create tables if they don't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE,
            username TEXT,
            password TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS bans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE
        )
    `);
});

// Register Endpoint
app.post('/register', (req, res) => {
    const { uuid, username, password } = req.body;

    // Check if UUID is banned
    db.get('SELECT * FROM bans WHERE uuid = ?', [uuid], (err, row) => {
        if (row) {
            res.json({ message: "This UUID is banned!" });
        } else {
            // Insert into users table
            db.run(
                'INSERT INTO users (uuid, username, password) VALUES (?, ?, ?)',
                [uuid, username, password],
                function (err) {
                    if (err) {
                        res.json({ message: "Registration failed. UUID may already exist." });
                    } else {
                        res.json({ message: "Registration successful!" });
                    }
                }
            );
        }
    });
});

// Ban Endpoint
app.post('/ban', (req, res) => {
    const { uuid } = req.body;

    // Insert into bans table
    db.run('INSERT INTO bans (uuid) VALUES (?)', [uuid], function (err) {
        if (err) {
            res.json({ message: "UUID is already banned." });
        } else {
            res.json({ message: `UUID ${uuid} has been banned.` });
        }
    });
});

// Check Ban Endpoint
app.get('/check-ban', (req, res) => {
    const uuid = req.query.uuid;

    // Check if UUID is banned
    db.get('SELECT * FROM bans WHERE uuid = ?', [uuid], (err, row) => {
        if (row) {
            res.json({ banned: true });
        } else {
            res.json({ banned: false });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Export the app for Vercel
module.exports = app;
