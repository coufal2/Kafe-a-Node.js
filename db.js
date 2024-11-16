const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor(dbFile) {
        this.dbFile = dbFile;
        this.connection = null;
    }

    async connect() {
        if (this.connection) {
            console.warn('Database connection is already open.');
            return this.connection;
        }

        try {
            this.connection = await new Promise((resolve, reject) => {
                const db = new sqlite3.Database(this.dbFile, (err) => {
                    if (err) {
                        console.error("Connection failed: " + err.message);
                        reject(err);
                    } else {
                        console.log("Connected to the SQLite database.");
                        resolve(db);
                    }
                });
            });
            return this.connection;
        } catch (error) {
            throw new Error(`Failed to connect to database: ${error.message}`);
        }
    }

    async close() {
        if (!this.connection) {
            console.warn('No open connection to close.');
            return;
        }

        try {
            await new Promise((resolve, reject) => {
                this.connection.close((err) => {
                    if (err) {
                        console.error("Error closing the connection: " + err.message);
                        reject(err);
                    } else {
                        console.log("Connection to the SQLite database closed.");
                        this.connection = null;
                        resolve();
                    }
                });
            });
        } catch (error) {
            throw new Error(`Failed to close database connection: ${error.message}`);
        }
    }
}

module.exports = Database;
