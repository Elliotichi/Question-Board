/*Enviroment Variables*/
require('dotenv').config();
const port = process.env.PORT;
const mongoConnect = process.env.MONGO_CONNECT;
/*Enviroment Variables*/

/*dependancies*/
const express = require('express');
const session = require('express-session');
const MongoClient = require("mongodb-legacy").MongoClient
const client = new MongoClient(mongoConnect);
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

const app = express();

// generates a random hex string for the session secret.
const sessionSecret = crypto.randomBytes(32).toString('hex');

// database variable
const db = client.db('Question-Board')

// questions collection variable
const questions = db.collection('questions');

// users collection variable
const users = db.collection('users')

app.use(express.json());
app.set('view engine', 'ejs');
app.use(session({
    secret: sessionSecret,
    resave: true,
    saveUninitialized: false
}));

const bodyParser = require('body-parser');
app.use(express.urlencoded({ extended: true }));
/*dependancies*/


app.use(express.static('public'))

// default route
app.get('/', (req, res) => {
    if (!req.session.loggedin) {
        res.render('pages/login.ejs');
    }
    else {
        res.render('pages/index.ejs', {})
    }
})

// get questions from mongoDB
app.get('/getQuestions', async (req, res) => {
    const data = await questions.find().toArray()
    console.table(data)
    res.json(data)
})

// login page route
app.get('/login', (req, res) => {
    res.render('pages/login');
})

// register page route
app.get('/register', (req, res) => {
    res.render('pages/register');
})

// allows access to session user
app.get('/getCurrentUser', (req, res) => {
    res.json({
        currentuser: req.session.currentuser
    });
});

// logs into the website by comparing details with a database entry.
app.post('/dologin', async (req, res) => {

    console.log(JSON.stringify(req.body))
    users.findOne({
        "username": req.body.username
    }, function (err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result))
        if (!result) {
            res.send("<script>alert('invalid Username')</script>;window.location.href = '/login';")
        }

        else if (result.password != req.body.password) {
            res.send("<script>alert('incorrect password')</script>;window.location.href = '/login';")
        }

        else if (result.password == req.body.password && result.username == req.body.username) {
            req.session.loggedin = true;
            req.session.currentuser = req.body.username;
            res.redirect("/")
        }
    })
})

// adds new question document to MongoDB
app.post('/postQuestion', async (req, res) => {
    try {
        await questions.insertOne(req.body)
        res.status(200).json({ message: 'Success' });
    }

    catch (error) {
        console.error(error)
    }
});

// Updates entry in MongoDB
app.post('/updateQuestion', async (req, res) => {
    try {
        const questionId = new ObjectId(req.body._id);
        console.log("updating entry with", req.body)
        await questions.updateOne(
            { _id: questionId },
            { $set: { upvotes: req.body.upvotes, viewers: req.body.viewers } }
        )
        res.status(200).json({ message: 'Success' });
    }

    catch (error) {
        console.error(error)
    }
});


// connect method for mongoDB
async function connectmongoDb() {
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

// start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

connectmongoDb();