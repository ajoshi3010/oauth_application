import 'dotenv/config'
import express from 'express'
import cors from 'cors';
import queryString from 'query-string'
import cookieParser from 'cookie-parser'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
const config = {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    authUrl: "https://accounts.google.com/o/oauth2/auth",
    tokenUrl: 'https://oauth2.googleapis.com/token',
    redirectUrl: process.env.REDIRECT_URL,
    clientUrl: process.env.CLIENT_URL,
    tokenSecret: process.env.TOKEN_SECRET,
    tokenExpiration: parseInt(process.env.TOKEN_EXPIRATION),
    postUrl: 'https://jsonplaceholder.typicode.com/posts',
    
}



const authParams = queryString.stringify({
    client_id: config.clientId,
    redirect_uri: config.redirectUrl,
    response_type: 'code',
    scope: 'openid profile email',
    access_type: 'offline',
    state: 'standard_oauth',
    prompt: 'consent',
})

const getTokenParams = (code) =>
    queryString.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUrl,
    })

const app = express()

// Resolve CORS
app.use(cors({origin: true, credentials: true}));

app.use(cookieParser())
app.use(express.json());


// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Define counter schema and model
// const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, // Email identifier for each user
    count: { type: Number, default: 0 },
    mycount: { type: Number, default: 0 }
}, { collection: 'counters' });

const Counter = mongoose.model('Counter', counterSchema);

// Routes
app.get('/api/counter', async (req, res) => {
    console.log("Reached GET method")
    try {
        const { email } = req.query; // Assuming email is sent as a query parameter
        
        let counter = await Counter.findOne({ email });
        if (!counter) {
            // If no counter exists for the email, create a new one
            counter = new Counter({ email });
            await counter.save();
        }
        
        console.log(counter);
        res.json(counter);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});
app.post('/api/counter/increment', async (req, res) => {
    try {
        const { email } = req.body;
        let counter = await Counter.findOne({ email });
        if (!counter) {
            counter = new Counter();
        }
        counter.count++;
        await counter.save();
        res.json(counter);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.post('/api/counter/decrement', async (req, res) => {
    try {
        const { email } = req.body;
        let counter = await Counter.findOne({ email });
        if (!counter) {
            counter = new Counter();
        }
        counter.count--;
        await counter.save();
        res.json(counter);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});
// Routes
app.get('/api/counter2', async (req, res) => {
    console.log("Reached GET method")
    try {
        
        const { email } = req.query; // Assuming email is sent as a query parameter
        const counter = await Counter.findOne({ email });
        if (!counter) {
            // If no counter exists for the email, create a new one
            counter = new Counter({ email });
            await counter.save();
        }
        console.log(counter);
        res.json(counter);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.post('/api/counter/increment2', async (req, res) => {
    try {
        const { email } = req.body;
        let counter = await Counter.findOne({ email });
        if (!counter) {
            counter = new Counter();
        }
        counter.mycount++;
        await counter.save();
        res.json(counter);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.post('/api/counter/decrement2', async (req, res) => {
    try {
        const { email } = req.body;
        let counter = await Counter.findOne({ email });
        if (!counter) {
            counter = new Counter();
        }
        counter.mycount--;
        await counter.save();
        res.json(counter);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});



// Verify auth
const auth = (req, res, next) => {
    try {
        const token = req.cookies.token
        if (!token) return res.status(401).json({ message: 'Unauthorized' })
        jwt.verify(token, config.tokenSecret)
        return next()
    } catch (err) {
        console.error('Error: ', err)
        res.status(401).json({ message: 'Unauthorized' })
    }
}


app.get('/auth/url', (_, res) => {
    console.log(`${config.authUrl}?${authParams}`)
    res.json({
        url: `${config.authUrl}?${authParams}`,
    })
})

app.get('/auth/token', async (req, res) => {
    const { code } = req.query
    if (!code) return res.status(400).json({ message: 'Authorization code must be provided' })
    try {
        // Get all parameters needed to hit authorization server
        const tokenParam = getTokenParams(code)
        // Exchange authorization code for access token (id token is returned here too)
        const {
            data: { id_token },
        } = await axios.post(`${config.tokenUrl}?${tokenParam}`)
        if (!id_token) return res.status(400).json({ message: 'Auth error' })
        // Get user info from id token
        const { email, name, picture } = jwt.decode(id_token)
        const user = { name, email, picture }
        // Sign a new token
        const token = jwt.sign({ user }, config.tokenSecret, { expiresIn: config.tokenExpiration })
        // Set cookies for user
        res.cookie('token', token, { maxAge: config.tokenExpiration, httpOnly: true })
        // You can choose to store user in a DB instead
        res.json({
            user,
        })
    } catch (err) {
        console.error('Error: ', err)
        res.status(500).json({ message: err.message || 'Server error' })
    }
})

app.get('/auth/logged_in', (req, res) => {
    try {
        // Get token from cookie   
        const token = req.cookies.token
        console.log(token)     
        if (!token) return res.json({ loggedIn: false })
        const { user } = jwt.verify(token, config.tokenSecret)
        const newToken = jwt.sign({ user }, config.tokenSecret, { expiresIn: config.tokenExpiration })
        // Reset token in cookie
        res.cookie('token', newToken, { maxAge: config.tokenExpiration, httpOnly: true })
        console.log({ loggedIn: true, user })
        res.json({ loggedIn: true, user })
    } catch (err) {
        res.json({ loggedIn: false })
    }
})

app.post('/auth/logout', (_, res) => {
    // clear cookie
    res.clearCookie('token').json({ message: 'Logged out' })
})

app.get('/user/posts', auth, async (_, res) => {
    try {
        const { data } = await axios.get(config.postUrl)
        res.json({ posts: data?.slice(0, 5) })
    } catch (err) {
        console.error('Error: ', err)
    }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(` Server listening on port ${PORT}`))