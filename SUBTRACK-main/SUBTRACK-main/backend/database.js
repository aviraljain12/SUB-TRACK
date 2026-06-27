const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// Ensure the data directory exists
const dbDir = path.join(__dirname, "data");
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "data.db");

// Delete existing database if it exists
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database:", err);
    } else {
        console.log("Connected to SQLite database");
    }
});

db.serialize(() => {
    // Users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email_address TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        );
    `, (err) => {
        if (err) {
            console.error("Error creating users table:", err);
        } else {
            console.log("Users table created successfully");
            // Seed default user
            const defaultName = "Dev User";
            const defaultEmail = "dev@test.com";
            const defaultHash = "$2a$10$hUS0TUpsfGDkhnYbJxNTCu8/cF0Imbnpb1KGCLpuwTGjlxiPtpmdK";
            db.run(
                "INSERT OR IGNORE INTO users (user_id, full_name, email_address, password_hash) VALUES (1, ?, ?, ?)",
                [defaultName, defaultEmail, defaultHash],
                (err) => {
                    if (err) console.error("Error seeding default user:", err);
                    else console.log("Default user dev@test.com seeded successfully");
                }
            );
        }
    });

    // Subscriptions table
    db.run(`
        CREATE TABLE IF NOT EXISTS subscriptions (
            subscription_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            service_name TEXT NOT NULL,
            plan_name TEXT NOT NULL,
            billing_amount REAL NOT NULL,
            subscription_status TEXT DEFAULT 'active',
            start_date TEXT NOT NULL,
            next_renewal_date TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(user_id)
        );
    `, (err) => {
        if (err) console.error("Error creating subscriptions table:", err);
        else console.log("Subscriptions table created successfully");
    });

    // Payments table
    db.run(`
        CREATE TABLE IF NOT EXISTS payments (
            payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            service_name TEXT NOT NULL,
            plan_name TEXT NOT NULL,
            paid_amount REAL NOT NULL,
            payment_date TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(user_id)
        );
    `, (err) => {
        if (err) console.error("Error creating payments table:", err);
        else console.log("Payments table created successfully");
    });
});

module.exports = db;
