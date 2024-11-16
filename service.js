const DbDriver = require('./dbdriver');

class Service {
    constructor() {
        this.dbdrv = new DbDriver();
        this.tab_people = "people";
        this.tab_types = "types";
    }

    async getPeopleList() {
        return this.fetchData(this.tab_people);
    }

    async getTypesList() {
        return this.fetchData(this.tab_types);
    }

    async fetchData(table) {
        try {
            return await this.dbdrv.select(table, "*");
        } catch (error) {
            console.error(`Error fetching data from ${table}:`, error.message);
            return [];
        }
    }

    processRequest(input) {
        const data = this.parseInput(input);
        this.validateRequest(data);
        // Implement your logic here
    }

    parseInput(input) {
        try {
            return JSON.parse(input);
        } catch (error) {
            console.error('Invalid JSON input:', error.message);
            throw new Error('Invalid input format');
        }
    }

    validateRequest(data) {
        if (!data.user) {
            throw new Error('User ID is required');
        }
        // Add more validation as needed
    }

    async saveDrinks(drinks) {
        console.log("Received drinks data:", drinks);
        
        const userID = drinks.user || null;
        if (!userID) return this.handleError("No user provided");

        const types = drinks.type || [];
        if (types.length === 0) return this.handleError("No types provided");

        let insertCount = 0;

        for (let i = 0; i < types.length; i++) {
            if (types[i] === 0) continue;

            const row = [new Date().toISOString().split('T')[0], userID, i + 1];
            console.log("Inserting row:", row);

            try {
                insertCount += await this.dbdrv.insertRow('drinks', row);
            } catch (error) {
                console.error('Error inserting row:', error.message);
            }
        }

        return insertCount > 0 ? 1 : -1;
    }
    
    async getSummaryOfDrinks(data) {
        const month = data.month || 0;

        const sql = this.buildSummaryQuery(month);
        try {
            return await this.dbdrv.selectQ(sql);
        } catch (error) {
            console.error('Error fetching summary of drinks:', error.message);
            return [];
        }
    }

    buildSummaryQuery(month) {
        let sql = `
            SELECT types.typ, count(drinks.ID) as pocet, people.name as name 
            FROM drinks 
            JOIN people ON drinks.id_people = people.ID 
            JOIN types ON drinks.id_types = types.ID`;
        
        if (month > 0 && month < 13) {
            sql += ` WHERE strftime('%m', date) = '${('0' + month).slice(-2)}'`;
        }
        
        sql += " GROUP BY types.typ";
        return sql;
    }

    handleError(message) {
        console.error(message);
        return -1;
    }
}

module.exports = Service;
