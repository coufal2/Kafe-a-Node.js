const Database = require('./db');

class DbDriver {
    constructor() {
        this.dbFile = 'data.sqlite'; 
        this.db = new Database(this.dbFile);
        this.cn = null;
    }

    async connect() {
        if (!this.cn) {
            this.cn = await this.db.connect();
        }
    }

    async query(sql, params = []) {
        await this.connect();
        try {
            return await new Promise((resolve, reject) => {
                this.cn.get(sql, params, (err, row) => {
                    if (err) reject(new Error(`Query failed: ${err.message}`));
                    else resolve(row);
                });
            });
        } catch (error) {
            throw new Error(`Failed to execute query: ${error.message}`);
        }
    }

    async select(tab, colm = '*') {
        await this.connect();
        const List = Array.isArray(colm) ? colm.join(', ') : colm;
        const sql = `SELECT ${List} FROM ${tab}`;

        try {
            return await new Promise((resolve, reject) => {
                this.cn.all(sql, (err, rows) => {
                    if (err) reject(new Error(`Select failed: ${err.message}`));
                    else resolve(rows);
                });
            });
        } catch (error) {
            throw new Error(`Failed to select from ${tab}: ${error.message}`);
        }
    }

    async insertRow(tab, arr) {
        await this.connect();
        if (!Array.isArray(arr)) {
            throw new Error('Input is not an array');
        }
        
        const placeholders = arr.map(() => '?').join(', ');
        const sql = `INSERT INTO ${tab} VALUES (NULL, ${placeholders})`;

        try {
            return await new Promise((resolve, reject) => {
                this.cn.run(sql, arr, function (err) {
                    if (err) {
                        reject(new Error(`Insert failed: ${err.message}`));
                    } else {
                        resolve(this.lastID);
                    }
                });
            });
        } catch (error) {
            throw new Error(`Failed to insert row: ${error.message}`);
        }
    }

    async selectQ(sql, params = []) {
        await this.connect();
        try {
            return await new Promise((resolve, reject) => {
                this.cn.all(sql, params, (err, rows) => {
                    if (err) reject(new Error(`Select query failed: ${err.message}`));
                    else resolve(rows);
                });
            });
        } catch (error) {
            throw new Error(`Failed to execute select query: ${error.message}`);
        }
    }

    async close() {
        return this.db.close();
    }
}

module.exports = DbDriver;
