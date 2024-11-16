const express = require('express');
const bodyParser = require('body-parser');
const Requests = require('./request');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.all('/request', async (req, res) => {
    process.env.REQUEST_METHOD = req.method;
    process.env.GET = JSON.stringify(req.query, null, 2); 
    process.env.POST = JSON.stringify(req.body, null, 2);

    console.log(`Incoming request:`);
    console.log(`Method: ${req.method}`);
    console.log(`Query parameters: ${process.env.GET}`);
    console.log(`Body parameters: ${process.env.POST}`);

    try {
        const requestHandler = new Requests(); 
        const output = await requestHandler.processRequest();

        res.status(200).send({ message: 'Request processed', output });
    } catch (error) {
        console.error('Error processing request:', error.message);
        console.error('Stack trace:', error.stack);
        res.status(500).send({ error: 'Error processing request' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
