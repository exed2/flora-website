const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const db = new sqlite3.Database('./database.sqlite');

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

app.post('/register', (req, res) => {
    const { uuid, username, password } = req.body;

    db.get('SELECT * FROM bans WHERE uuid = ?', [uuid], (err, row) => {
        if (row) {
            res.json({ message: "This UUID is banned!" });
        } else {

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

app.post('/ban', (req, res) => {
    const { uuid } = req.body;

    db.run('INSERT INTO bans (uuid) VALUES (?)', [uuid], function (err) {
        if (err) {
            res.json({ message: "UUID is already banned." });
        } else {
            res.json({ message: `UUID ${uuid} has been banned.` });
        }
    });
});

app.get('/check-ban', (req, res) => {
    const uuid = req.query.uuid;

    db.get('SELECT * FROM bans WHERE uuid = ?', [uuid], (err, row) => {
        if (row) {
            res.json({ banned: true });
        } else {
            res.json({ banned: false });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
