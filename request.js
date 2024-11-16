const Service = require('./service');

class Requests {
    constructor() {
        this.ser = new Service();
        this.method = process.env.REQUEST_METHOD;
        this.GETdata = this.parseInput(process.env.GET);
        this.POSTdata = this.parseInput(process.env.POST);
    }

    parseInput(input) {
        try {
            return input ? JSON.parse(input) : {};
        } catch (error) {
            console.error('Error parsing input:', error.message);
            return {};
        }
    }

    async controller(cmd) {
        cmd = cmd.replace('cmd/', '');

        const commandMap = {
            getPeopleList: () => this.ser.getPeopleList(),
            getTypesList: () => this.ser.getTypesList(),
            saveDrinks: () => {
                console.log('Saving drinks with data:', this.POSTdata);
                return this.ser.saveDrinks(this.POSTdata);
            },
            listCmd: () => ['getPeopleList', 'getTypesList', 'saveDrinks', 'getSummaryOfDrinks'],
            getSummaryOfDrinks: () => {
                console.log('Received GET data for summary:', this.GETdata);
                return this.ser.getSummaryOfDrinks(this.GETdata);
            }
        };

        const command = commandMap[cmd];
        if (command) {
            try {
                const result = await command();
                console.log(`Command executed successfully: ${cmd}`, result);
                return result;
            } catch (error) {
                console.error(`Error executing command "${cmd}":`, error.message);
                return { error: `Error executing command: ${cmd}` };
            }
        } else {
            console.error(`Unknown command: ${cmd}`);
            return { error: `Unknown command: ${cmd}` };
        }
    }

    async processRequest() {
        const command = this.GETdata.cmd || '';
        return this.controller(command);
    }
}

module.exports = Requests;
