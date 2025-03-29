const express = require('express');
const session = require('express-session');
const { MongoClient, ServerApiVersion } = require('mongodb');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const port = process.env.PORT;
const uri = process.env.MONGO_CONNECT;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version

// generates a random hex string for the session secret.
const sessionSecret = crypto.randomBytes(32).toString('hex');

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const db = client.db('Question-Board')
const questions = db.collection('questions');

app.use(express.json());
app.set('view engine', 'ejs');
app.use(session({
    secret: sessionSecret,
    resave: true,
    saveUninitialized: false
}));


app.use(express.static('public'))

// Sample route
app.get('/', (req, res) => {
    res.render('index.ejs');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

async function connectDb() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await db.command({ ping: 1 })
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (err) {
        console.error('Error fetching data:', err);
    }
}


function readDb() {
    try {
        console.log('All data:', data);
    }
    catch (err) {
        console.error('Error fetching data:', err);
    }
}

connectDb();