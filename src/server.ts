const express = require('express')
const mongoose = require('./db');
const axios = require('axios');
const app = express()
const { auth, requiredScopes } = require('express-oauth2-jwt-bearer')

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

const User = require('./model/user')
const Shop = require('./model/shop')
const Review = require('./model/review')

require('dotenv').config()

// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
});

app.post('/user/login', checkJwt, async (req , res) => {
    console.log('login api check')

    const userExist = await User.findOne({email: req.body.email});
    if(!userExist) {
        const newUser = new User({
            email: req.body.email,
            name: req.body.name,
            lastname: req.body.lastname,
        })

        newUser.save()
    }

    res.end(JSON.stringify({status: 200}));
})

app.post('/shop/create', async (req , res) => {
    
    const session = await mongoose.startSession()
    try {
        if(!session) {
            console.log('Error occur while starting session')
            res.status(500).send({ error: 'Internal server error' })
        }

        await session.startTransaction()

        if(!req.body.csvBuffer)
            res.status(500).send({error: 'Bad Request'})

        const csvShops = req.body.csvBuffer.split('\n')
        const header = csvShops[0].split(';')

        for(let i = 1; i < csvShops.length; i++){
            let shopData = csvShops[i].split(';')
            let newObj = {}
            for(let j = 0; j < shopData.length; j++){
                if(shopData[j]) {
                    newObj[header[j].trim()] = shopData[j].trim()
                }
            }

            const newShop = new Shop(newObj)
            await newShop.save({ session: session })
                .catch(async (error) => {
                    console.log(error)
                    return Promise.reject(error)
                });
        } 

        await session.commitTransaction()
        session.endSession()
        res.status(200).end()

    } catch (error) {
        console.error(error)
        if (session) {
            await session.abortTransaction()
            session.endSession()
        }
        res.status(500).send({ error: 'Internal server error' })
    }
})

app.get('/shop', async (req , res) => {
    try {
        const shops = await Shop.find()
        res.status(200).send({shops: shops})
    } catch (error){
        res.status(500).send({error: error.message})
    }
})

app.get('/user/:email?', checkJwt, async (req , res) => {
    try {
        if (req.params.email) {
            const user = await User.findOne({email: req.params.email});
            if (user) res.status(200).send({users: user})
            else res.status(404).send({error: 'User not found'})
        }
        else {
            const users = await User.find()
            res.status(200).send({users: users})
        }
    } catch (error){
        res.status(500).send({error: error.message})
    }
})

app.get('/review/:userId?', checkJwt, async (req , res) => {
    try {
        if (req.params.userId) {
            const reviews = await Review.find({userId: req.params.userId});
            res.status(200).send({reviews: reviews})
        }
        else {
            const reviews = await Review.find()
            res.status(200).send({reviews: reviews})
        }
    } catch (error){
        res.status(500).send({error: error.message})
    }
})

app.post('/review/upload', async (req, res) => { // TO DO: naming
    const session = await mongoose.startSession()
    try {
        if(!session) {
            console.log('Error occur while starting session')
            res.status(500).send({ error: 'Internal server error' })
        }

        await session.startTransaction()

        const { 
            name, 
            shopId, 
            userId, 
            review, 
            latitude, 
            longitude 
        } = req.body;
        
        console.log(req.body)

        const user = await User.findById({_id: userId});
        if (!user)
            return res.status(500).send({error: 'Bad Request'})

        const shop = await Shop.findById({_id: shopId});
        if (!shop)
            return res.status(500).send({error: 'Bad Request'})

        const newReview = new Review(req.body)

        await newReview.save({ session: session })

        await session.commitTransaction()
        session.endSession()
        res.status(200).end()
    } catch (error) {
        console.error(error)
        if (session) {
            await session.abortTransaction()
            session.endSession()
        }
        res.status(500).send({ error: 'Internal server error' })
    }
})

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    
    const port = 8000;
    app.listen(port, () => {
        console.log("Server started on port 8000")
    });
  });
  
  mongoose.connection.on('error', (error) => {
    console.error('Error connecting to MongoDB:', error)
  });
