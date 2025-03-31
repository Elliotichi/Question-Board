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
const { on } = require('events');
app.use(express.urlencoded({ extended: true }));
/*dependancies*/


app.use(express.static('public'))

// default route
app.get('/', (req, res) => {
    if (!req.session.loggedin) {
        res.render('pages/login.ejs');
    }
    else if (req.session.ishost) {
        res.render('pages/host.ejs');
    }
    else {
        res.render('pages/index.ejs');
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
    if (!req.session.loggedin) {
        res.render('pages/login');
    }
    else {
        res.render('pages/user')
    }
})

// register page route
app.get('/register', (req, res) => {
    res.render('pages/register');
})

// allows frontend access to session variables
app.get('/getSession', (req, res) => {
    res.status(200).json({
        session: req.session
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
            res.send("<script>alert('invalid Username');window.location.href = '/login';</script>")
        }

        else if (result.password != req.body.password) {
            res.send("<script>alert('incorrect password');window.location.href = '/login';</script>")
        }

        else if (result.password == req.body.password && result.username == req.body.username) {
            req.session.loggedin = true;
            req.session.currentuser = req.body.username;
            req.session.ishost = result.host
            res.redirect("/")
        }
    })
})

// logs user out
app.post('/logout', async (req, res) => {
    req.session.loggedin = false
    req.session.currentuser = null
    req.session.ishost = false
    res.redirect('/login')
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

// registers user into the database
app.post('/registerUser', async (req, res) => {
    let host;

    // check if the host option is ticked
    if (req.body.host == "on") {
        host = true
    }
    else {
        host = false
    }

    // checks if user already exists
    users.findOne({
        $or: [
            { "username": req.body.username }
        ]
    }, async function (err, existingUser) {
        if (err) throw err;
        if (existingUser) {
            console.log('user exists')
            res.send("<script>alert('Account Name already in use, please enter a different one');window.location.href = '/register';</script>")
        }
        // if user doesnt exist add user to database
        else {

            await users.insertOne(
                {
                    username: req.body.username,
                    password: req.body.password,
                    host: host
                }
            )
            req.session.loggedin = true;
            req.session.currentuser = req.body.username;
            req.session.ishost = host
            res.redirect('/')

        }
    })
});


// connect method for mongoDB
async function connectmongoDb() {
    try {
        await client.connect();
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